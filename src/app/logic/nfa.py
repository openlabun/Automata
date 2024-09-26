from collections import deque
import json

# Define the NFA class
class NFA:
    def __init__(self, initial, accept):
        self.initial = initial
        self.accept = accept
        self.transitions = {}

    def add_transition(self, state, symbol, next_state):
        if (state, symbol) not in self.transitions:
            self.transitions[(state, symbol)] = []
        self.transitions[(state, symbol)].append(next_state)

    def ennunmerate_states(self):
        # Diccionario para almacenar el número asignado a cada estado
        state_to_number = {}
        
        # Cola para realizar el recorrido BFS
        queue = deque([self.initial])
        
        # El estado inicial se numera como 0
        state_to_number[self.initial] = 0
        current_number = 1  # El siguiente número a asignar
        
        # Mientras haya estados en la cola
        while queue:
            # Tomamos el estado actual de la cola
            current_state = queue.popleft()
            
            # Recorremos todas las transiciones desde este estado
            for (state, symbol), next_states in self.transitions.items():
                if state == current_state:  # Si la transición parte del estado actual
                    # Iteramos sobre los estados de destino (next_states puede ser una lista)
                    for next_state in next_states:
                        # Verificar si el next_state es una lista y recorrerla si es el caso
                        if isinstance(next_state, list):
                            for state in next_state:
                                if state not in state_to_number:
                                    state_to_number[state] = current_number
                                    current_number += 1
                                    queue.append(state)  # Agregamos el estado a la cola para seguir explorando
                        else:
                            # Si next_state no es una lista, lo tratamos como un estado individual
                            if next_state not in state_to_number:
                                state_to_number[next_state] = current_number
                                current_number += 1
                                queue.append(next_state)  # Agregamos el estado a la cola
        
        # Verificamos que el estado de aceptación también tenga un número
        if self.accept not in state_to_number:
            state_to_number[self.accept] = current_number

        return state_to_number
    
    def build_transition_table(self):
        # Obtener la enumeración de los estados
        state_to_number = self.ennunmerate_states()
        # Inicializar la tabla de transición
        transition_table = {}
        
        for (state, symbol), next_states in self.transitions.items():
            current_state_num =state_to_number.get(state)
            
            if current_state_num not in transition_table:
                transition_table[current_state_num] = {}

            for next_state in next_states:
                # Verificamos si next_state es una lista y manejamos cada uno
                if isinstance(next_state, list):
                    for sub_state in next_state:
                        next_state_num =state_to_number.get(sub_state)
                        if symbol in transition_table[current_state_num]:
                            # Si ya existe la entrada para este símbolo, agregamos el estado a la lista
                            if next_state_num not in transition_table[current_state_num][symbol]:
                                transition_table[current_state_num][symbol].append(next_state_num)
                        else:
                            # Si no existe la entrada, inicializamos la lista
                            transition_table[current_state_num][symbol] = [next_state_num]
                else:
                    next_state_num =state_to_number.get(next_state)
                    if symbol in transition_table[current_state_num]:
                        # Si ya existe la entrada para este símbolo, agregamos el estado a la lista
                        if next_state_num not in transition_table[current_state_num][symbol]:
                            transition_table[current_state_num][symbol].append(next_state_num)
                    else:
                        # Si no existe la entrada, inicializamos la lista
                        transition_table[current_state_num][symbol] = [next_state_num]
        return transition_table

    
    # Print the transition table
    def print_transition_table(self):
        for state, transitions in self.build_transition_table().items():
            print(f"State {state}: {transitions}")

    def get_transition_table(self):
        # Inicializar un diccionario para la tabla de transiciones
        transition_table_json = {}
        
        # Construir el diccionario para JSON
        for current_state, transitions in self.build_transition_table().items():
            transition_table_json[current_state] = {}
            for symbol, next_states in transitions.items():
                transition_table_json[current_state][symbol] = next_states

        # Convertir el diccionario a JSON
        return transition_table_json
            
    
    def get_transitions_by_state(self,state):
        if state == self.accept:
            return None, self.accept
        for (s, symbol), next_states in self.transitions.items():
            if s == state:
                return symbol, next_states
        return None  # Si no se encuentra el estado


def mueve(string, state, nfa, path=None, all_paths=None):
    if path is None:
        path = []  # Inicializar el camino

    if all_paths is None:
        all_paths = []  # Inicializar la lista de todos los caminos

    # Agregar el estado actual al camino
    path.append(state)

    # Si el estado actual es el estado de aceptación y la cadena está vacía
    if state == nfa.accept and not string:
        all_paths.append((path.copy(), True))  # Añadir camino aceptado
        return all_paths
    
    # Obtener el símbolo y los próximos estados desde la transición actual
    transition = nfa.get_transitions_by_state(state)
    if transition is None:
        print("No hay transición desde el estado actual.")
        all_paths.append((path.copy(), False))  # Añadir camino no aceptado
        return all_paths

    symbol, next_states = transition
    
    # Procesar transiciones epsilon (símbolo "&")
    if symbol == "&":
        for next_state in next_states:
            if isinstance(next_state, list):
                next_state = next_state[0]
            # Hacer una llamada recursiva sin consumir el símbolo
            all_paths = mueve(string[:], next_state, nfa, path.copy(), all_paths)  # Copia el camino
    
    # Procesar transiciones normales, coincidiendo el símbolo
    elif string and string[0] == symbol:
        for next_state in next_states:
            if isinstance(next_state, list):
                next_state = next_state[0]
            # Consumir el símbolo y moverse al siguiente estado
            new_string = string.copy()  # Copia la cadena
            new_string.pop(0)
            all_paths = mueve(new_string, next_state, nfa, path.copy(), all_paths)  # Avanzar en la cadena
    
    # Si no hay coincidencias o transiciones
    if string or symbol != "&":
        all_paths.append((path.copy(), False))  # Añadir camino no aceptado solo al final
    return all_paths  # Retornar todos los caminos

def evaluate_string(string, nfa):
    caminos = mueve(string, nfa.initial, nfa)
    state_to_number = nfa.ennunmerate_states()
    print("Todos los caminos:")
    status = "Rechazada"
    for camino, aceptado in caminos:
        if aceptado:
            status = "Aceptada"
        camino = [state_to_number[state] for state in camino]
        print(f"Caminos: {camino}, Aceptado: {aceptado}")
    
    #ToJSON
    json_caminos = []
    for camino, aceptado in caminos:
        camino = [state_to_number[state] for state in camino]
        json_caminos.append({"camino": camino, "aceptado": aceptado})
    return json.dumps(json_caminos), status



# Functions to create basic NFA fragments
# Rule #1: An Empty Expression (ε) is an NFA with two states and an epsilon transition between them.
# Rule #2: A Single Symbol (a) is an NFA with two states, one initial state and one final state, and a transition between them labeled with the symbol.
def basic_nfa(initial, accept):
    i = initial
    a = accept
    nfa = NFA(i, a)
    return nfa

# Functions to create NFA fragments for operators

# Rule #3: Union expression
def union_nfa(nfa1, nfa2):
    initial = object()
    accept = object()
    nfa = basic_nfa(initial, accept)
    for (state, symbol), next_states in nfa1.transitions.items():
        nfa.add_transition(state, symbol, next_states)
    for (state, symbol), next_states in nfa2.transitions.items():
        nfa.add_transition(state, symbol, next_states)
    nfa.add_transition(initial, "&", nfa1.initial)
    nfa.add_transition(initial, "&", nfa2.initial)
    nfa.add_transition(nfa1.accept, "&", accept)
    nfa.add_transition(nfa2.accept, "&", accept)
    return nfa

# Rule #4: Concatenation expression
def concat_nfa(nfa1, nfa2):
    symbolns2,next_states2 = nfa2.get_transitions_by_state(nfa2.initial)
    for next_state in next_states2:
        nfa1.add_transition(nfa1.accept, symbolns2, next_state)

    for (state, symbol), next_states in nfa2.transitions.items():
        #Only if the state is not the initial state
        if state != nfa2.initial:
            nfa1.add_transition(state, symbol, next_states)
    nfa1.accept = nfa2.accept
    return nfa1

# Rule #5: Kleene star expression
def kleene_nfa(nfa):
    initial = object()
    accept = object()
    nfa.add_transition(initial, "&", accept)
    nfa.add_transition(initial, "&", nfa.initial)
    nfa.add_transition(nfa.accept, "&", nfa.initial)
    nfa.add_transition(nfa.accept, "&", accept)
    nfa.initial = initial
    nfa.accept = accept
    return nfa

# Rule #6: Positive closure expression
def positive_nfa(nfa):
    initial = object()
    accept = object()
    nfa.add_transition(initial, "&", nfa.initial)
    nfa.add_transition(nfa.accept, "&", accept)
    nfa.add_transition(nfa.accept, "&", nfa.initial)
    nfa.initial = initial
    nfa.accept = accept
    return nfa

# Rule #7: Optional expression
def optional_nfa(nfa):
    initial = object()
    accept = object()
    nfa.add_transition(initial, "&", nfa.initial)
    nfa.add_transition(nfa.accept, "&", accept)
    nfa.initial = initial
    nfa.accept = accept


