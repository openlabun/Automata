#NFA's by thompson's construction
#This is an implementation of Thompson's construction to convert a postfix regular expression to a non-deterministic finite automaton (NFA).
#The algorithm is as follows:
#1. Create a stack to keep track of the NFA fragments.
#2. For each symbol in the postfix regular expression:
#    1. If the symbol is a letter (a symbol in our case), then create a new NFA fragment with two states,
#       one initial state and one final state, and add a transition between them labeled with the symbol.
#       Push this new fragment onto the stack.
#    2. If the symbol is an operator:
#        1. If the symbol is '|':
#            1. Pop two NFA fragments from the stack.
#            2. Create a new initial state and a new final state.
#            3. Add epsilon transitions from the new initial state to the initial states of the two fragments,
#               and from the final states of the two fragments to the new final state.
#            4. Push the new fragment onto the stack.
#        2. If the symbol is '.':
#            1. Pop two NFA fragments from the stack.
#            2. Add an epsilon transition from the final state of the first fragment to the initial state of the second fragment.
#            3. Push the new fragment onto the stack.
#        3. If the symbol is '*':
#            1. Pop one NFA fragment from the stack.
#            2. Create a new initial state and a new final state.
#            3. Add epsilon transitions from the new initial state to the initial state of the fragment,
#               and from the final state of the fragment to the new final state.
#            4. Add epsilon transitions from the new initial state to the new final state,
#               and from the final state of the fragment to the new initial state.
#            5. Push the new fragment onto the stack.
#        4. If the symbol is '+':
#            1. Pop one NFA fragment from the stack.
#            2. Create a new initial state and a new final state.
#            3. Add epsilon transitions from the new initial state to the initial state of the fragment,
#               and from the final state of the fragment to the new final state.
#            4. Add epsilon transitions from the final state of the fragment to the initial state of the fragment.
#            5. Push the new fragment onto the stack.
#        5. If the symbol is '?':
#            1. Pop one NFA fragment from the stack.
#            2. Create a new initial state and a new final state.
#            3. Add epsilon transitions from the new initial state to the initial state of the fragment,
#               and from the final state of the fragment to the new final state.
#            4. Add epsilon transitions from the new initial state to the new final state,
#               and from the final state of the fragment to the new final state.
#            5. Push the new fragment onto the stack.
#3. The resulting NFA is the only fragment left on the stack.
#4. Return the resulting NFA.

from nfa import basic_nfa, union_nfa, concat_nfa, kleene_nfa, positive_nfa, optional_nfa

def thompson(postfix):
    stack = []
    for c in postfix:
        if c.isalpha():
            nfa = basic_nfa(object(),object())
            nfa.add_transition(nfa.initial, c, nfa.accept)
            stack.append(nfa)
        elif c == '|':
            nfa2 = stack.pop()
            nfa1 = stack.pop()
            stack.append(union_nfa(nfa1, nfa2))
        elif c == '.':
            nfa2 = stack.pop()
            nfa1 = stack.pop()
            stack.append(concat_nfa(nfa1, nfa2))
        elif c == '*':
            nfa = stack.pop()
            stack.append(kleene_nfa(nfa))
        elif c == '+':
            nfa = stack.pop()
            stack.append(positive_nfa(nfa))
        elif c == '?':
            nfa = stack.pop()
            stack.append(optional_nfa(nfa))
    return stack[0]

# Example usage