from flask import Flask, session, url_for, render_template, request, redirect, escape, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from data_access import queries
import logging
from logging import Formatter, FileHandler
import os
import requests
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'


@app.route('/')
def list_of_planets():
    if 'username' in session:
        username = escape(session['username'])
        return render_template('/index.html', username=username)
    return render_template('index.html')


@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    hashed_pw = queries.check_user_return_pw(username)

    if hashed_pw:
        is_pw_ok = check_password_hash(hashed_pw, password)
    else:
        is_pw_ok = False

    if is_pw_ok:
        session['username'] = username
        return redirect(url_for('list_of_planets'))

    flash('Invalid username or password', 'danger')
    return redirect(url_for('list_of_planets'))


@app.route('/register', methods=['POST'])
def register():
    username = request.form['reg_username']
    password = generate_password_hash(request.form['reg_password'])
    if not queries.check_if_user_exists(username):
        if queries.insert_user(username, password):  # query will return false if there was a database error
            session['username'] = username
            flash('Succesfully registered account: ' + session['username'], 'success')
            return redirect(url_for('list_of_planets'))
        else:
            flash('An errror has occured. Registration cancelled.', 'danger')
            return redirect(url_for('list_of_planets'))
    flash('Registration failed, username already exists.', 'warning')
    return redirect(url_for('list_of_planets'))


@app.route('/logout', methods=['GET'])
def logout():
    flash('logged out from account: ' + session['username'], 'info')
    session.pop('username', None)
    return redirect(url_for('list_of_planets'))


@app.route('/planet_vote', methods=['POST'])
def planet_vote():
    content = request.get_json()
    planet_id = content['planetId'].split('/')[-2]
    if queries.insert_vote(planet_id, session['username'], datetime.now()):
        return jsonify({'message': 'Registered vote for ' + content['planetName'],
                        'category': 'success'})
    return jsonify({'message': 'An error occured while attempting to register vote!',
                    'category': 'danger'})


@app.route('/residents', methods=['POST'])
def residents():
    url_list_for_residents = request.get_json()
    residents = []
    for url in url_list_for_residents:
        response = requests.get(url).json()
        response['height'] = number_formatter(response['height'], 'm')
        response['mass'] = number_formatter(response['mass'], 'kg')
        residents.append(response)
    return jsonify(residents)


@app.route('/planet_statistics', methods=['POST'])
def planet_stats():
    stats_from_db = queries.vote_stats()
    stats_for_all_planets = []

    for planet in stats_from_db['planet_stats']:
        planet_data_from_api = requests.get('http://swapi.co/api/planets/'+str(planet[0])).json()
        planet_data = {'planet_name': planet_data_from_api['name'],
                       'planet_votes': planet[1],
                       'percent_of_highest_vote': ''}
        stats_for_all_planets.append(planet_data)

    stats_for_all_planets[0]['percent_of_highest_vote'] = 100
    for i in range(1, len(stats_for_all_planets)):
        stats_for_all_planets[i]['percent_of_highest_vote'] = (stats_for_all_planets[i]['planet_votes'] /
                                                               stats_for_all_planets[0]['planet_votes']) * 100
    return jsonify(stats_for_all_planets)


def number_formatter(number_to_format, unit_of_measurement):
    formatted_number = "unknown"
    if number_to_format != "unknown" and unit_of_measurement != "m":
        formatted_number = number_to_format + " " + str(unit_of_measurement)
    elif number_to_format != "unknown" and unit_of_measurement == "m":
        int(number_to_format)
        formatted_number = str(float(number_to_format)/100) + " " + str(unit_of_measurement)
    return formatted_number


if not app.debug:
    file_handler = FileHandler('error.log')
    file_handler.setFormatter(
        Formatter('%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]')
    )
    app.logger.setLevel(logging.INFO)
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.info('errors')


if __name__ == '__main__':
    app.run()
