"use client";
import { useState, useEffect} from "react";
import styles from "./page.module.css";
import Automata from "./components/automata";
import TransitionTable from "./components/transitionTable";
import Alphabet from "./components/alphabet";
import Subset from "./components/subset";
import Optimize from "./components/optimize";

export default function Home() {
  const [regex, setRegex] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [error, setError] = useState("");
  const [symbols, setSymbols] = useState([]);
  const [nfaTable, setNfaTable] = useState(null);
  const [tranD, setTranD] = useState(null);
  const [significantStatesVariable, setSignificantStatesVariable] = useState(null);
  const [states, setStates] = useState(null);
  const [initialStates, setInitialStates] = useState(null);
  const [acceptStates, setAcceptStates] = useState(null);
  const methodLabels = {
    thompson: 'Método de Thompson',
    subconjuntos: 'Método de Subconjuntos',
    estadosSignificativos: 'Método de Estados Significativos',
  };
  const [selectedMethod, setSelectedMethod] = useState('thompson');
  const [lastRegex, setLastRegex] = useState("");
  const [isReady, setIsReady] = useState(false); 

  useEffect(() => {
    if (isReady) {
      handleMethodSwitch();
    }
  }, [selectedMethod, isReady]); 
  

  const thompson = async () => {

    let postfix = {};
    let symbols = {};
    let nfaTable = {};
    let initial_state = null;
    let accept_states = null;

    if(!regex){
      return;
    }

    try {
      const responseValidate = await fetch('/api/process/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          regex,  // Send the regex key to match the API
        }),
      });

      const dataValidate = await responseValidate.json();

      if (responseValidate.ok) {

        postfix = dataValidate.postfix;
        symbols = dataValidate.symbols;

        const responseThompson = await fetch('/api/process/thompson', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postfix: dataValidate.postfix,
            symbols: dataValidate.symbols,
          }),
        });

        const dataThompson = await responseThompson.json();

        if (responseThompson.ok) {

          setIsReady(true);
          postfix = dataValidate.postfix;
          symbols = dataValidate.symbols;
          nfaTable = dataThompson.transition_table;
          initial_state = dataThompson.initial_state;
          accept_states = dataThompson.accept_states;

          return { postfix, symbols, nfaTable, initial_state, accept_states};

        } else {
          setError(`Error: ${dataThompson.error}`);
        }
      } else {
        setError(`Error: ${dataValidate.error}`);
      }
    } catch (error) {
      setError('Failed to process the regular expression.');
    }
  };

  const subset = async (postfix, symbols) => {
    if (!postfix || !symbols) return; 
  
    try {
      const responseValidate = await fetch('/api/process/subset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postfix,
          symbols,
        }),
      });
  
      const dataValidate = await responseValidate.json();
  
      if (responseValidate.ok) {
        return {
          tranD: dataValidate.TranD,
          states: dataValidate.States,
          initialStates: dataValidate.initial_state,
          acceptStates: dataValidate.accept_states,
        };
      } else {
        setError(`Error: ${dataValidate.error}`);
      }
    } catch (error) {
      setError('Failed to process the regular expression.');
    }
  };
  
  const significantStates = async (postfix, symbols) => {

    if (!postfix || !symbols) return; 
  
    try {
      const responseValidate = await fetch('/api/process/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postfix,
          symbols,
        }),
      });
  
      const dataValidate = await responseValidate.json();
  
      if (responseValidate.ok) {

        console.log('toda la data', dataValidate);

        return {
          tranD: dataValidate.TranD,
          states: dataValidate.States,
          initialStates: dataValidate.initial_state,
          acceptStates: dataValidate.accept_states,
        };
      } else {
        setError(`Error: ${dataValidate.error}`);
      }
    } catch (error) {
      setError('Failed to process the regular expression.');
    }
  };

  const handleMethodSwitch = async () => {
    console.log(`Switched to: ${selectedMethod}`);
  
    const { postfix, symbols, nfaTable, initial_state, accept_states } = await thompson();

    if (!isReady) return;

    setShowTable(true);
    setSymbols(symbols);

    if (selectedMethod === "thompson") {

      setNfaTable(nfaTable);
      setInitialStates(initial_state);
      setAcceptStates(accept_states);

      console.log(nfaTable);

    } else if(selectedMethod === "subconjuntos") {

      const {tranD, states, initialStates, acceptStates} = await subset(postfix, symbols);
      setNfaTable(tranD);
      setTranD(tranD);
      setStates(states);
      setInitialStates(initialStates);
      setAcceptStates(acceptStates);

    } else if (selectedMethod === "estadosSignificativos") {

      const {tranD, states, initialStates, acceptStates} = await significantStates(postfix, symbols);
      setNfaTable(tranD);
      setTranD(tranD);
      setStates(states);
      setInitialStates(initialStates);
      setAcceptStates(acceptStates);

      console.log(tranD);
      console.log(states);
      console.log(initialStates);
      console.log(acceptStates);

    }

  };

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
  };

  const handleInputChange = (event) => {
    setRegex(event.target.value);
    setNfaTable(null);
    setShowTable(false);
    setLastRegex("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (regex.trim() === lastRegex) {
      return;
    }

    setLastRegex(regex.trim());

    if (regex.trim() === "") {
      setError("La expresión regular no puede estar vacía.");
      setShowTable(false);
      setNfaTable(null);
      return;
    }

    const isBalanced = (str) => {
      let stack = [];
      for (let char of str) {
        if (char === "(") stack.push(char);
        else if (char === ")") {
          if (stack.length === 0) return false; 
          stack.pop();
        }
      }
      return stack.length === 0;
    };

    if (!isBalanced(regex)) {
      setError("Los paréntesis no están balanceados.");
      setShowTable(false);
      setNfaTable(null);
      return;
    }

    const invalidOr = /.+\|.+/;

    if (regex.includes('|')) { 
      if (!invalidOr.test(regex)) {
        setError("El operador | requiere dos operandos.");
        setShowTable(false);
        setNfaTable(null);
        return;
      }
    }

    if (regex.includes('.')) {
      setError("La expresión no puede contener el carácter '.'");
      setShowTable(false);
      setNfaTable(null);
      return;
    }

    try {
      new RegExp(regex);
    } catch (e) {
      setError("La expresión regular ingresada no es válida.");
      setShowTable(false);
      setNfaTable(null);
      return;
    }

    handleMethodSwitch();
    
    setError("");
    setShowTable(true);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Automata Visualizer</h1>
        <nav className={styles.navbar}>
          <div className={styles.methodButtons}>
            {Object.keys(methodLabels).map((method) => (
              <button
                key={method}
                className={`${styles.menuItem} ${selectedMethod === method ? styles.active : ''}`}
                onClick={() => handleSelectMethod(method)}
              >
                {methodLabels[method]}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <div className={styles.container}>
        <div className={styles.data}>
          <form onSubmit={handleSubmit}>
            <div className={styles.inputContainer}>
              <input
                type="text"
                className={styles.input}
                id="regex"
                name="regex"
                placeholder="Ingrese Expresion Regular..."
                autoComplete="off"
                value={regex}
                onChange={handleInputChange}
              />
              <input
                className={styles.buttonsubmit}
                value="Comenzar"
                type="submit"
              />
            </div>
            {error && <div className={styles.error}>{error}</div>}
          </form>

          <div className={styles.information}>
            {showTable && <div><Alphabet symbols={symbols} /></div>}
            {showTable  && selectedMethod === "thompson" && <div><TransitionTable nfaTable={nfaTable} /></div>}
            {showTable && selectedMethod === "subconjuntos" && (
              <div><Subset TranD={tranD} States={states} InitialState={initialStates} AcceptState={acceptStates} /></div>
            )}
            {showTable && selectedMethod === "estadosSignificativos" && (
              <div><Optimize TranD={tranD} States={states} InitialState={initialStates} AcceptState={acceptStates} /></div>
            )}
          </div>
          
        </div>
        <Automata nfaTable={nfaTable} regex={regex} method={selectedMethod} initial_state={initialStates} accept_states={acceptStates}/>
      </div>

      <footer className={styles.footer}>
        <p>&copy; 2024 Automata Visualizer. Desarrollado por: Ana ardila, Luis Parra, Edgar Torres & Juan Vargas.</p>
      </footer>
    </div>
  );
}