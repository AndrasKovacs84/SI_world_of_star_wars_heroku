import psycopg2
import sys
from .personal_config import my_connection


def connect_to_sql(func):
    def with_connection(*args):
        connection = None
        sql_query_func = None
        try:
            # setup connection string
            connect_str = my_connection()
            # use our connection values to establish a connection
            connection = psycopg2.connect(host=connect_str["host"],
                                          user=connect_str["user"],
                                          password=connect_str["passwd"],
                                          dbname=connect_str["dbname"])
            # set autocommit option, to do every query when we call it
            connection.autocommit = True
            # create a psycopg2 cursor that can execute queries
            cursor = connection.cursor()

            # use ure function
            sql_query_func = func(cursor, *args)

            # Close communication with the database
            cursor.close()

        except psycopg2.IntegrityError as db_exception:
            print("From IntegrityError: %s" % db_exception)
            # If you want to handle it on an other level raise the following:
            print(db_exception.with_traceback(sys.exc_info()[2]))

        except psycopg2.DatabaseError as db_exception:
            print("From DatabaseError: %s" % db_exception)
            # If you want to handle it on an other level raise the following:
            print(db_exception.with_traceback(sys.exc_info()[2]))

        except psycopg2.InterfaceError as db_exception:
            print("From InterfaceError, something with the database interface: %s" % db_exception)
            print(db_exception.with_traceback(sys.exc_info()[2]))

        finally:
            if connection:
                connection.close()

        return sql_query_func
    return with_connection
