from .server_connection.connect import connect_to_sql
import psycopg2


@connect_to_sql
def insert_vote(cursor, planet_id, username, submission_time):
    statement = """ INSERT INTO planet_votes
                    (planet_id, user_id, submission_time)
                    VALUES (%s, (SELECT id
                                FROM sw_users
                                WHERE username=%s), %s); """
    try:
        cursor.execute(statement, (planet_id, username, submission_time))
        return True
    except psycopg2.Error:
        return False


@connect_to_sql
def insert_user(cursor, username, password):
    statement = """ INSERT INTO sw_users
                    (username, password)
                    VALUES (%s, %s); """
    try:
        cursor.execute(statement, (username, password))
        return True
    except psycopg2.Error:
        return False


@connect_to_sql
def check_user_return_pw(cursor, username):
    statement = """
                SELECT password
                FROM sw_users
                WHERE username = %s
                """
    cursor.execute(statement, (username,))
    result = cursor.fetchall()

    if result:
        return result[0][0]
    return False


@connect_to_sql
def check_if_user_exists(cursor, username):
    statement = """
                SELECT *
                FROM sw_users
                WHERE username = %s
                """
    cursor.execute(statement, (username,))
    result = cursor.fetchall()

    if result:
        return True
    return False


@connect_to_sql
def vote_stats(cursor):
    result = {'planet_stats': '',
              'total_nr_of_votes': ''}
    statement = """
                SELECT planet_id, COUNT(*) AS nr_of_votes
                FROM planet_votes
                GROUP BY planet_id
                ORDER BY nr_of_votes DESC
                """
    cursor.execute(statement)
    result['planet_stats'] = cursor.fetchall()
    statement = """SELECT COUNT(*) FROM planet_votes"""
    cursor.execute(statement)
    result['total_nr_of_votes'] = cursor.fetchall()
    return result
