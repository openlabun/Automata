"use client";
import { useState, useEffect} from "react";
import styles from "./page.module.css";
import Automata from "./components/automata";
import TransitionTable from "./components/transitionTable";
import Alphabet from "./components/alphabet";
import Subset from "./components/subset";

export default function Home() {
  const [regex, setRegex] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [error, setError] = useState("");
  const [postfix, setPostfix] = useState("");
  const [symbols, setSymbols] = useState([]);
  const [nfaTable, setNfaTable] = useState(null);
  const [tranD, setTranD] = useState(null);
  const [significantStatesVariable, setSignificantStatesVariable] = useState(null);
  const [states, setStates] = useState(null);

  const methodLabels = {
    thompson: 'Método de Thompson',
    subconjuntos: 'Método de Subconjuntos',
    estadosSignificativos: 'Método de Estados Significativos',
  };
  const [selectedMethod, setSelectedMethod] = useState('thompson');
  const [lastRegex, setLastRegex] = useState("");
  const [isReady, setIsReady] = useState(false); 

  useEffect(() => {
    if (postfix && symbols) {
      setShowTable(true);
    }
  }, [postfix, symbols]); 
  
  useEffect(() => {
    if (isReady) {
      handleMethodSwitch();
    }
  }, [selectedMethod, isReady]); 
  

  const thompson = async () => {
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
        setPostfix(dataValidate.postfix);
        setSymbols(dataValidate.symbols);
        setShowTable(true);

        // Thompson API call
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
          setPostfix(dataValidate.postfix);
          setSymbols(dataValidate.symbols);
          setIsReady(true); 
          if(selectedMethod === "thompson"){
            console.log('Thompson:', dataThompson.transition_table);
            setNfaTable(dataThompson.transition_table);
          }
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

  const subset = async () => {
    if (!postfix || !symbols) return; // Verifica que se hayan establecido los datos necesarios
  
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
        setTranD(dataValidate.TranD);
        setSignificantStatesVariable(dataValidate.Significant_states);
        setStates(dataValidate.States);
        setNfaTable(dataValidate.TranD);

        console.log('ENNVIANDO Subset:', dataValidate.TranD);
        console.log('postfix:', postfix);
      } else {
        setError(`Error: ${dataValidate.error}`);
      }
    } catch (error) {
      setError('Failed to process the regular expression.');
    }
  };

  const significantStates = async () => {
    if (!postfix || !symbols) return; // Verifica que se hayan establecido los datos necesarios
  
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
        setNfaTable(dataValidate.TranD);
      } else {
        setError(`Error: ${dataValidate.error}`);
      }
    } catch (error) {
      setError('Failed to process the regular expression.');
    }
  };

  const handleMethodSwitch = async () => {
    console.log(`Switched to: ${selectedMethod}`);
  
    await thompson();
  
    if (!isReady) return;
  
    if (selectedMethod === "subconjuntos") {
      await subset();
    } else if (selectedMethod === "estadosSignificativos") {
      await significantStates();
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

    // Check for balanced parentheses and invalid operators
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

    const invalidOr = /([|]{2,})|(^[|])|([|]$)|([*+?]{1,})[|]/;
    if (invalidOr.test(regex)) {
      setError("El operador | requiere dos operandos.");
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
              <div><Subset TranD={tranD} States={states} /></div>
            )}
          </div>
        </div>
        <Automata nfaTable={nfaTable} regex={regex} method={selectedMethod}/>
      </div>

      <footer className={styles.footer}>
        <p>&copy; 2024 Automata Visualizer. Desarrollado por: Ana ardila, Luis Parra, Edgar Torres & Juan Vargas.</p>
      </footer>
    </div>
  );
}
