import json
from postfixer import shunting_yard
from construction import thompson
from nfa import evaluate_string
import sys

if __name__ == "__main__":

    infix = sys.argv[1]  # First argument (regex)

    print("Infix:   ", infix)
    print("String:  ", sys.argv[2] if len(sys.argv) > 2 else "")
    
    if len(sys.argv) > 2:
        string = sys.argv[2]  
    else:
        string = ""  

    postfix, symbols = shunting_yard(infix)
    nfa = thompson(postfix)
    nfa_table = nfa.get_transition_table()
    
    if string:
        paths, status = evaluate_string(list(string), nfa)
    else:
        paths = []
        status = "no input string provided"

    result = {
        "postfix": postfix,
        "nfa_table": nfa_table,
        "status": status,
        "paths": paths  
    }

    print(json.dumps(result))
