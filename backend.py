from flask import Flask, render_template, request, session, jsonify, redirect, url_for
import mysql.connector
from mysql.connector import Error
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'secretkey'

#cookie fix
app.config.update(
    SESSION_COOKIE_SAMESITE='None',  
    SESSION_COOKIE_SECURE=True,      
)

def databaseconnection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="Graduate_Thesis_System"
)

def get_current_user_id():
    return session.get('user_id')

@app.route('/get_user_roles', methods=['GET'])
def get_user_roles():
    roles = session.get('roles', [])
    return jsonify({'roles': roles})

@app.route('/gate')
def gate():
    if 'user_id' in session:
        return redirect(url_for('index'))  
    return render_template('gate.html')

#index & serach
@app.route('/index')
def index():
    if 'user_id' not in session:
        return redirect(url_for('indexpublic'))  
    return render_template('index.html',session_data=session)

@app.route('/')
def indexpublic():
    if 'user_id' in session:
        return redirect(url_for('index'))
    return render_template('indexpublic.html')  


@app.route('/searchmenu')
def searchmenu():
    if 'user_id' in session:
        return render_template('searchmenu.html',session_data=session)
    else:
        return render_template('searchmenu.html')
@app.route('/search_thesis', methods=['POST'])
def search_thesis():
    data = request.get_json()

    title = data.get('TitleSearchValue', '')
    abstract = data.get('AbstractSearchValue', '')
    author_name = data.get('AuthorSearchValue', '')
    year_lower = data.get('year_lower', '')
    year_upper = data.get('year_upper', '')
    type_id = data.get('type_id', '')
    institute_id = data.get('institute_id', '')
    university_id = data.get('university_id', '')
    language_id = data.get('language_id', '')
    keyword = data.get('KeywordSearchValue', '')
    topic_id = data.get('topic_id', '')
    supervisor_ids = data.get('supervisor_id', [])
    cosupervisor_ids = data.get('cosupervisor_id', [])

    conn = databaseconnection()
    cursor = conn.cursor(dictionary=True)

    # Base query
    query = """
    SELECT DISTINCT
        t.thesis_id,
        t.title, 
        t.abstract, 
        a.name_surname AS author_name, 
        GROUP_CONCAT(DISTINCT s.name_surname) AS supervisor_name, 
        GROUP_CONCAT(DISTINCT cs.name_surname) AS cosupervisor_name, 
        i.institute_name AS institute_name, 
        u.uni_name AS university_name, 
        st.topic_name, 
        k.keyword, 
        ty.type, 
        t.number_of_pages, 
        l.language, 
        t.year, 
        t.submission_date
    FROM thesis t
    LEFT JOIN author a ON a.author_id = t.author_id
    LEFT JOIN type ty ON ty.type_id = t.type_id
    LEFT JOIN thesis_cosupervisor tcs ON tcs.thesis_id = t.thesis_id
    LEFT JOIN supervisor cs ON cs.supervisor_id = tcs.supervisor_id
    LEFT JOIN thesis_supervisor ts ON ts.thesis_id = t.thesis_id
    LEFT JOIN supervisor s ON s.supervisor_id = ts.supervisor_id
    LEFT JOIN thesis_keywords tk ON tk.thesis_id = t.thesis_id
    LEFT JOIN keywords k ON k.keyword_id = tk.keyword_id
    LEFT JOIN thesis_subject_topics tst ON tst.thesis_id = t.thesis_id
    LEFT JOIN subject_topics st ON st.subject_topics_id = tst.subject_topic_id
    LEFT JOIN university u ON u.university_id = t.university_id
    LEFT JOIN institutes i ON i.institutes_id = t.institute_id
    LEFT JOIN language l ON l.language_id = t.language_id
    WHERE (%s = '' OR t.title LIKE CONCAT('%', %s, '%'))
    AND (%s = '' OR t.abstract LIKE CONCAT('%', %s, '%'))
    AND (%s = '' OR a.name_surname LIKE CONCAT('%', %s, '%'))
    AND (%s = '' OR t.year >= %s)
    AND (%s = '' OR t.year <= %s)
    AND (%s = '' OR ty.type_id = %s)
    AND (%s = '' OR i.institutes_id = %s)
    AND (%s = '' OR u.university_id = %s)
    AND (%s = '' OR l.language_id = %s)
    AND (%s = '' OR st.subject_topics_id = %s)
    AND (%s = '' OR k.keyword LIKE CONCAT('%', %s, '%'))
    """

    #supervisor fix
    if supervisor_ids:
        placeholders = ", ".join(["%s"] * len(supervisor_ids))
        query += f" AND ts.supervisor_id IN ({placeholders})"
    if cosupervisor_ids:
        placeholders = ", ".join(["%s"] * len(cosupervisor_ids))
        query += f" AND tcs.supervisor_id IN ({placeholders})"

    query += " GROUP BY t.thesis_id"

    # parametreler
    params = [
        title, title, abstract, abstract, author_name, author_name,
        year_lower, year_lower, year_upper, year_upper, type_id, type_id,
        institute_id, institute_id, university_id, university_id,
        language_id, language_id, topic_id, topic_id, keyword, keyword
    ]
    params += supervisor_ids + cosupervisor_ids

    try:
        cursor.execute(query, tuple(params))
        results = cursor.fetchall()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

    return jsonify(results)


#index & search

#myprofile
@app.route('/myprofile')
def myprofile():
    if 'user_id' in session:
        return render_template('myprofile.html',session_data=session)
    else:
        return redirect(url_for('gate'))

@app.route('/myprofiletheses', methods=['GET'])
def myprofiletheses():
    connection = databaseconnection()
    cursor = connection.cursor(dictionary=True)

    author_id = session.get('author_id')
    if not author_id:
        return jsonify({'status': 'error', 'message': 'Author ID is missing'}), 400

    
    
    cursor.execute("""
        SELECT t.thesis_id, t.title, t.abstract, t.year, t.type_id, t.institute_id, 
               t.university_id, t.number_of_pages, t.language_id, t.submission_date,
               i.institute_name, u.uni_name, l.language, tp.type, t.author_id
        FROM thesis t
        LEFT JOIN institutes i ON t.institute_id = i.institutes_id
        LEFT JOIN university u ON t.university_id = u.university_id
        LEFT JOIN language l ON t.language_id = l.language_id
        LEFT JOIN type tp ON t.type_id = tp.type_id
        WHERE t.author_id = %s
    """, (author_id,))
    
    theses = cursor.fetchall()

    result = []
    for thesis in theses:
        thesis_id = thesis['thesis_id']
        author_id = thesis['author_id']  

        
        cursor.execute("""
            SELECT name_surname 
            FROM author 
            WHERE author_id = %s
        """, (author_id,))
        author = cursor.fetchone()
        author_name = author['name_surname'] if author else 'Unknown Author'

        
        cursor.execute("""
            SELECT k.keyword 
            FROM thesis_keywords tk
            JOIN keywords k ON tk.keyword_id = k.keyword_id
            WHERE tk.thesis_id = %s
        """, (thesis_id,))
        keywords = [keyword['keyword'] for keyword in cursor.fetchall()]

        
        cursor.execute("""
            SELECT st.topic_name 
            FROM thesis_subject_topics tst
            JOIN subject_topics st ON tst.subject_topic_id = st.subject_topics_id
            WHERE tst.thesis_id = %s
        """, (thesis_id,))
        subject_topics = [topic['topic_name'] for topic in cursor.fetchall()]

        
        cursor.execute("""
            SELECT s.name_surname 
            FROM thesis_supervisor ts
            JOIN supervisor s ON ts.supervisor_id = s.supervisor_id
            WHERE ts.thesis_id = %s
        """, (thesis_id,))
        supervisor = [supervisor['name_surname'] for supervisor in cursor.fetchall()]

        
        cursor.execute("""
            SELECT s.name_surname 
            FROM thesis_cosupervisor tc
            JOIN supervisor s ON tc.supervisor_id = s.supervisor_id
            WHERE tc.thesis_id = %s
        """, (thesis_id,))
        co_supervisors = [supervisor['name_surname'] for supervisor in cursor.fetchall()]

        
        thesis_data = {
            'thesisId': thesis['thesis_id'],
            'title': thesis['title'],
            'abstract': thesis['abstract'],  
            'year': thesis['year'],
            'type': thesis['type'],  
            'institute': thesis['institute_name'],  
            'university': thesis['uni_name'],  
            'numPages': thesis['number_of_pages'],  
            'lang': thesis['language'],  
            'submissionDate': thesis['submission_date'],  
            'author': author_name,  
            'topics': subject_topics,  
            'supervisor': supervisor,   
            'coSupervisors': co_supervisors,  
            'keywords': keywords  
        }
        result.append(thesis_data)
    cursor.close()
    connection.close()

    return jsonify(result)

@app.route('/myprofilesupervisor', methods=['GET'])
def myprofilesupervisor():
    if 'supervisor' not in session.get('roles', []):
        return jsonify({'status': 'error', 'message': 'User does not have supervisor role'}), 403

    
    user_email = session.get('email')
    if not user_email:
        return jsonify({'status': 'error', 'message': 'User email is missing'}), 400

    connection = databaseconnection()
    cursor = connection.cursor(dictionary=True)

    
    cursor.execute("""
        SELECT supervisor_id 
        FROM supervisor 
        WHERE supervisor_email = %s
    """, (user_email,))
    supervisor = cursor.fetchone()
    if not supervisor:
        return jsonify({'status': 'error', 'message': 'Supervisor not found'}), 404

    supervisor_id = supervisor['supervisor_id']

    
    cursor.execute("""
        SELECT DISTINCT t.thesis_id, t.title, t.abstract, t.year, t.type_id, t.institute_id, 
                        t.university_id, t.number_of_pages, t.language_id, t.submission_date,
                        i.institute_name, u.uni_name, l.language, tp.type, t.author_id
        FROM thesis t
        LEFT JOIN institutes i ON t.institute_id = i.institutes_id
        LEFT JOIN university u ON t.university_id = u.university_id
        LEFT JOIN language l ON t.language_id = l.language_id
        LEFT JOIN type tp ON t.type_id = tp.type_id
        LEFT JOIN thesis_supervisor ts ON t.thesis_id = ts.thesis_id
        LEFT JOIN thesis_cosupervisor tc ON t.thesis_id = tc.thesis_id
        WHERE ts.supervisor_id = %s OR tc.supervisor_id = %s
    """, (supervisor_id, supervisor_id))
    
    theses = cursor.fetchall()

    result = []
    for thesis in theses:
        thesis_id = thesis['thesis_id']
        author_id = thesis['author_id']

        
        cursor.execute("""
            SELECT name_surname 
            FROM author 
            WHERE author_id = %s
        """, (author_id,))
        author = cursor.fetchone()
        author_name = author['name_surname'] if author else 'Unknown Author'

        
        cursor.execute("""
            SELECT k.keyword 
            FROM thesis_keywords tk
            JOIN keywords k ON tk.keyword_id = k.keyword_id
            WHERE tk.thesis_id = %s
        """, (thesis_id,))
        keywords = [keyword['keyword'] for keyword in cursor.fetchall()]

        
        cursor.execute("""
            SELECT st.topic_name 
            FROM thesis_subject_topics tst
            JOIN subject_topics st ON tst.subject_topic_id = st.subject_topics_id
            WHERE tst.thesis_id = %s
        """, (thesis_id,))
        subject_topics = [topic['topic_name'] for topic in cursor.fetchall()]

        
        cursor.execute("""
            SELECT s.name_surname 
            FROM thesis_supervisor ts
            JOIN supervisor s ON ts.supervisor_id = s.supervisor_id
            WHERE ts.thesis_id = %s
        """, (thesis_id,))
        supervisor = [supervisor['name_surname'] for supervisor in cursor.fetchall()]

        
        cursor.execute("""
            SELECT s.name_surname 
            FROM thesis_cosupervisor tc
            JOIN supervisor s ON tc.supervisor_id = s.supervisor_id
            WHERE tc.thesis_id = %s
        """, (thesis_id,))
        co_supervisors = [supervisor['name_surname'] for supervisor in cursor.fetchall()]

        
        thesis_data = {
            'thesisId': thesis['thesis_id'],
            'title': thesis['title'],
            'abstract': thesis['abstract'],
            'year': thesis['year'],
            'type': thesis['type'],
            'institute': thesis['institute_name'],
            'university': thesis['uni_name'],
            'numPages': thesis['number_of_pages'],
            'lang': thesis['language'],
            'submissionDate': thesis['submission_date'],
            'author': author_name,
            'topics': subject_topics,
            'supervisor': supervisor,
            'coSupervisors': co_supervisors,
            'keywords': keywords
        }
        result.append(thesis_data)
    cursor.close()
    connection.close()

    return jsonify(result)

#myprofile

@app.route('/submissionpage')
def submissionpage():
    if 'user_id' in session:
        return render_template('submission.html',session_data=session)
    else:
        return redirect(url_for('gate'))

#register login logout
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data['name']
    email = data['email']
    password = data['password']
    hashed_password = generate_password_hash(password)
    
    try:
        connection = databaseconnection()  
        cursor = connection.cursor()  
        cursor.execute("INSERT INTO author (name_surname, author_email) VALUES (%s, %s)", (name, email))
        author_id = cursor.lastrowid
        cursor.execute("INSERT INTO users (user_email, password, name_surname) VALUES (%s, %s, %s)", (email, hashed_password, name))
        connection.commit()
        cursor.close()  
        connection.close()
        return jsonify({"success": True, "message": "Registration successful!"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data['email']
    password = data['password']

    try:
        connection = databaseconnection()
        cursor = connection.cursor()

        
        cursor.execute("SELECT user_id, password, name_surname FROM users WHERE user_email = %s", (email,))
        user = cursor.fetchone()

        if user and check_password_hash(user[1], password):
            
            session['user_id'] = user[0]
            session['email'] = email
            session['name_surname'] = user[2]  
            session['roles'] = ['user']  

            
            cursor.execute("SELECT author_id FROM author WHERE author_email = %s", (email,))
            author = cursor.fetchone()
            if author:
                session['author_id'] = author[0]  

            
            cursor.execute("SELECT supervisor_id FROM supervisor WHERE supervisor_email = %s", (email,))
            supervisor = cursor.fetchone()
            if supervisor:
                session['roles'].append('supervisor')

            cursor.close()
            connection.close()
            return jsonify({
                "success": True,
                "message": "Login successful!",
                "roles": session['roles'],
                "author_id": session.get('author_id'),
                "name_surname": session['name_surname']  
            })

        
        cursor.close()
        connection.close()
        return jsonify({"success": False, "message": "Invalid email or password."})

    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred: {str(e)}"})

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('indexpublic'))  
#register login logout

#topics menu
#topic menu endpoint
@app.route('/topicmenu')
def topicmenu():
    if 'user_id' in session:
        return render_template('topicmenu.html',session_data=session)
    else:
        return render_template('topicmenu.html')
#topic table retriever
@app.route('/retrieve_topics_for_topic_menu')
def retrieve_topics_for_topic_menu():
    connection = databaseconnection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT subject_topics_id, topic_name FROM subject_topics")
    topics = cursor.fetchall()
    print(topics)
    connection.close()
    return jsonify(topics)
#topics menu

#language menu
#language menu endpoint
@app.route('/languagemenu')
def languagemenu():
    if 'user_id' in session:
        return render_template('languagemenu.html',session_data=session)
    else:
        return render_template('languagemenu.html')

@app.route('/retrieve_languages_for_language_menu', methods=['GET'])
def retrieve_languages_for_language_menu():
    connection = databaseconnection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT language_id, language FROM language")
    languages = cursor.fetchall()
    connection.close()
    return jsonify(languages)

@app.route('/add_language_to_language_menu', methods=['POST'])
def add_language():
    data = request.get_json()
    new_language = data.get('language', '').strip()

    if not new_language:
        return jsonify({'success': False, 'error': 'Invalid language name'}), 400

    try:
        connection = databaseconnection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("INSERT INTO language (language) VALUES (%s)", (new_language,))
        connection.commit()
        language_id = cursor.lastrowid
        connection.close()
        return jsonify({'success': True, 'language': {'language_id': language_id, 'language': new_language}})
    except mysql.connector.Error as err:
        return jsonify({'success': False, 'error': str(err)}), 500
@app.route('/remove_language/<int:language_id>', methods=['DELETE'])
def remove_language(language_id):
    try:
        connection = databaseconnection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM language WHERE language_id = %s", (language_id,))
        connection.commit()
        connection.close()
        return jsonify({'success': True})
    except mysql.connector.Error as err:
        return jsonify({'success': False, 'error': str(err)}), 500

#language menu

#keyword menu
#keyword menu endpoint
@app.route('/keywordmenu')
def keywordmenu():
    if 'user_id' in session:
        return render_template('keywordmenu.html',session_data=session)
    else:
        return render_template('keywordmenu.html')

@app.route('/retrieve_keywords_for_keyword_menu', methods=['GET'])
def retrieve_keywords_for_keyword_menu():
    connection = databaseconnection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT keyword_id, keyword FROM keywords")
    keywords = cursor.fetchall()
    connection.close()
    return jsonify(keywords)

@app.route('/add_keyword_to_keyword_menu', methods=['POST'])
def add_keyword():
    data = request.get_json()
    new_keyword = data.get('keyword', '').strip()

    if not new_keyword:
        return jsonify({'success': False, 'error': 'Invalid keyword name'}), 400

    try:
        connection = databaseconnection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("INSERT INTO keywords (keyword) VALUES (%s)", (new_keyword,))
        connection.commit()
        keyword_id = cursor.lastrowid
        connection.close()
        return jsonify({'success': True, 'keyword': {'keyword_id': keyword_id, 'keyword': new_keyword}})
    except mysql.connector.Error as err:
        return jsonify({'success': False, 'error': str(err)}), 500
@app.route('/remove_keyword/<int:keyword_id>', methods=['DELETE'])
def remove_keyword(keyword_id):
    try:
        connection = databaseconnection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM keywords WHERE keyword_id = %s", (keyword_id,))
        connection.commit()
        connection.close()
        return jsonify({'success': True})
    except mysql.connector.Error as err:
        return jsonify({'success': False, 'error': str(err)}), 500

#keyword menu

#submission type dropdown
@app.route('/retrieve_types', methods=['GET'])
def retrieve_types():
    connection = databaseconnection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT type_id, type FROM type")  
    types = cursor.fetchall()
    connection.close()
    return jsonify(types)
#submission type dropdown

#university menu

@app.route('/universitymenu')
def universitymenu():
    if 'user_id' in session:
        return render_template('universitymenu.html', session_data=session)
    else:
        return render_template('universitymenu.html')

@app.route('/retrieve_universities_for_university_menu', methods=['GET'])
def retrieve_universities_for_university_menu():
    connection = databaseconnection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT university_id, uni_name FROM university")
    universities = cursor.fetchall()
    connection.close()
    return jsonify(universities)

@app.route('/add_university_to_university_menu', methods=['POST'])
def add_university():
    data = request.get_json()
    new_university = data.get('uni_name', '').strip()

    if not new_university:
        return jsonify({'success': False, 'error': 'Invalid university name'}), 400

    try:
        connection = databaseconnection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("INSERT INTO university (uni_name) VALUES (%s)", (new_university,))
        connection.commit()
        university_id = cursor.lastrowid
        connection.close()
        return jsonify({'success': True, 'university': {'university_id': university_id, 'uni_name': new_university}})
    except mysql.connector.Error as err:
        return jsonify({'success': False, 'error': str(err)}), 500

@app.route('/remove_university/<int:university_id>', methods=['DELETE'])
def remove_university(university_id):
    try:
        connection = databaseconnection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM university WHERE university_id = %s", (university_id,))
        connection.commit()
        connection.close()
        return jsonify({'success': True})
    except mysql.connector.Error as err:
        return jsonify({'success': False, 'error': str(err)}), 500
#university menu

#institute menu
@app.route('/institutemenu')
def institutemenu():
    if 'user_id' in session:
        return render_template('institutemenu.html', session_data=session)
    else:
        return render_template('institutemenu.html')

@app.route('/retrieve_institutes', methods=['GET'])
def retrieve_institutes():
    connection = databaseconnection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("""
        SELECT i.institutes_id, i.institute_name, u.university_id, u.uni_name 
        FROM institutes i
        JOIN university u ON i.university_id = u.university_id
    """)
    institutes = cursor.fetchall()
    connection.close()
    return jsonify(institutes)

@app.route('/add_institute', methods=['POST'])
def add_institute():
    data = request.get_json()
    institute_name = data.get('institute_name', '').strip()
    university_id = data.get('university_id')

    if not institute_name or not university_id:
        return jsonify({'success': False, 'error': 'Invalid institute or university'}), 400

    try:
        connection = databaseconnection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("INSERT INTO institutes (institute_name, university_id) VALUES (%s, %s)", (institute_name, university_id))
        connection.commit()
        institute_id = cursor.lastrowid
        connection.close()
        return jsonify({'success': True, 'institute': {'institutes_id': institute_id, 'institute_name': institute_name, 'university_id': university_id}})
    except mysql.connector.Error as err:
        return jsonify({'success': False, 'error': str(err)}), 500

@app.route('/remove_institute/<int:institute_id>', methods=['DELETE'])
def remove_institute(institute_id):
    try:
        connection = databaseconnection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM institutes WHERE institutes_id = %s", (institute_id,))
        connection.commit()
        connection.close()
        return jsonify({'success': True})
    except mysql.connector.Error as err:
        return jsonify({'success': False, 'error': str(err)}), 500
#institute menu

#supervisor menu
@app.route('/supervisormenu')
def supervisormenu():
    if 'user_id' in session:
        return render_template('supervisormenu.html', session_data=session)
    else:
        return render_template('supervisormenu.html')

@app.route('/retrieve_supervisors_for_supervisor_menu', methods=['GET'])
def retrieve_supervisors_for_supervisor_menu():
    connection = databaseconnection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT supervisor_id, name_surname, supervisor_email, phone FROM supervisor")
    supervisors = cursor.fetchall()
    connection.close()
    return jsonify(supervisors)

@app.route('/add_supervisor_to_supervisor_menu', methods=['POST'])
def add_supervisor():
    data = request.get_json()
    name_surname = data.get('name_surname', '').strip()
    phone = data.get('phone', '').strip()
    supervisor_email = data.get('supervisor_email', '').strip()

    if not name_surname:
        return jsonify({'success': False, 'error': 'Invalid supervisor name'}), 400

    try:
        connection = databaseconnection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("INSERT INTO supervisor (name_surname, supervisor_email, phone) VALUES (%s, %s, %s)", 
                       (name_surname, supervisor_email, phone))
        connection.commit()
        supervisor_id = cursor.lastrowid
        connection.close()
        return jsonify({'success': True, 'supervisor': {'supervisor_id': supervisor_id, 'name_surname': name_surname, 'supervisor_email': supervisor_email, 'phone': phone}})
    except mysql.connector.Error as err:
        return jsonify({'success': False, 'error': str(err)}), 500

@app.route('/remove_supervisor/<int:supervisor_id>', methods=['DELETE'])
def remove_supervisor(supervisor_id):
    try:
        connection = databaseconnection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM supervisor WHERE supervisor_id = %s", (supervisor_id,))
        connection.commit()
        connection.close()
        return jsonify({'success': True})
    except mysql.connector.Error as err:
        return jsonify({'success': False, 'error': str(err)}), 500
#supervisor menu

#thesis submission
@app.route('/submit_thesis', methods=['POST'])
def submit_thesis():
    connection = databaseconnection()
    cursor = connection.cursor()
    
    data = request.json

    author_id = session.get('author_id') or data.get('author_id')
    if not author_id:
        return jsonify({'status': 'error', 'message': 'Author ID is missing'}), 400

    
    title = data.get('title')
    abstract = data.get('abstract')
    year = data.get('year')
    type_id = data.get('type_id')
    institute_id = data.get('institute_id')
    university_id = data.get('university_id')
    number_of_pages = data.get('number_of_pages')
    language_id = data.get('language_id')
    submission_date = data.get('submission_date')
    keywords = data.get('keywords')  
    topics = data.get('topics')      
    supervisor_ids = data.get('supervisor_ids')  
    cosupervisor_ids = data.get('cosupervisor_ids')  

    try:
        with connection:
            with connection.cursor() as cursor:
                
                cursor.execute("START TRANSACTION;")

                
                cursor.execute("""
                    INSERT INTO thesis (title, abstract, author_id, year, type_id, institute_id, university_id, 
                                        number_of_pages, language_id, submission_date)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (title, abstract, author_id, year, type_id, institute_id, university_id, 
                      number_of_pages, language_id, submission_date))
                
                thesis_id = cursor.lastrowid  

                
                for keyword_id in keywords:
                    cursor.execute("""
                        INSERT INTO thesis_keywords (thesis_id, keyword_id) VALUES (%s, %s)
                    """, (thesis_id, keyword_id))

                
                for topic_id in topics:
                    cursor.execute("""
                        INSERT INTO thesis_subject_topics (thesis_id, subject_topic_id) VALUES (%s, %s)
                    """, (thesis_id, topic_id))

                
                for supervisor_id in supervisor_ids:
                    cursor.execute("""
                        INSERT INTO thesis_supervisor (thesis_id, supervisor_id) VALUES (%s, %s)
                    """, (thesis_id, supervisor_id))

                
                for cosupervisor_id in cosupervisor_ids:
                    cursor.execute("""
                        INSERT INTO thesis_cosupervisor (thesis_id, supervisor_id) VALUES (%s, %s)
                    """, (thesis_id, cosupervisor_id))

                
                connection.commit()
        
        return jsonify({'status': 'success', 'thesis_id': thesis_id}), 200
    except Exception as e:
        connection.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500
#thesis submission


if __name__ == '__main__':
    app.run(debug=True)


