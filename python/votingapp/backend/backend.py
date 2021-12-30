from flask import request
import psycopg2


def main():
    try:
        data = request.json
        vote = data['vote']
        voter_id = data['voter_id']
        option_a = "Mountains"
        option_b = "Beaches"

        # Query to insert votes
        sql = """INSERT INTO votebank(voter_id, vote)
             VALUES(%s,%s) RETURNING id;"""

        # Query to get total votes
        votequery = """SELECT vote, count(id) FROM votebank GROUP BY vote"""

        # Creating the connection
        conn = psycopg2.connect(database="votedb", user='postgres', password='postgres',
                                host='postgresql.default.svc.cluster.local', port='5432')

        # Creating a cursor object using the cursor() method
        cursor = conn.cursor()

        # Executing an MYSQL function using the execute() method
        cursor.execute(sql, (voter_id, vote))

        # Fetch a single row using fetchone() method.
        id = cursor.fetchone()[0]

        # Getting total votes
        cursor.execute(votequery)
        votecount = cursor.fetchall()
        vote_mountains = votecount[0][1]
        vote_beaches = votecount[1][1]
        votes = {option_b: vote_beaches, option_a: vote_mountains}

        # Committing and closing connection
        conn.commit()
        conn.close()

    except KeyError:
        return 'No Data found'
    if id != "":
        return votes
    else:
        return 'Error'
