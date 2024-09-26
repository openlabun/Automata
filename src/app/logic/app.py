from flask import Flask, request, jsonify
from flask_cors import CORS
from postfixer import shunting_yard
from construction import thompson
from nfa import evaluate_string

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from the Next.js frontend

@app.route('/process', methods=['POST'])
def process_regex():
    try:
        data = request.json
        regex = data.get('regex')
        string = data.get('string', "")

        if not regex:
            return jsonify({"error": "Missing regex"}), 400

        postfix, symbols = shunting_yard(regex)
        nfa = thompson(postfix)
        nfa_table = nfa.get_transition_table()

        if string:
            paths, status = evaluate_string(list(string), nfa)
        else:
            paths = []
            status = "no input string provided"

        result = {
            "postfix": postfix,
            "symbols": symbols,
            "nfa_table": nfa_table,
            "status": status,
            "paths": paths
        }

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)  

