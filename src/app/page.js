"use client";
import { useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";
import Automata from "./components/automata";
import TransitionTable from "./components/transitionTable";
import Alphabet from "./components/alphabet";
import Subset from "./components/subset";
import Optimize from "./components/optimize";
import { handleAutomatonProcess } from "@/dataRetriever/data";

export default function Home() {
  const [regex, setRegex] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [error, setError] = useState("");
  const [symbols, setSymbols] = useState([]);
  const [nfaTable, setNfaTable] = useState(null);
  const [transThomposn, setTransThomposn] = useState(null);
  const [tranD, setTranD] = useState(null);
  const [states, setStates] = useState(null);
  const [initialStates, setInitialState] = useState(null);
  const [acceptStates, setAcceptStates] = useState(null);
  
  const methodLabels = useMemo(() => ({
    thompson: 'Método de Thompson',
    subconjuntos: 'Método de Subconjuntos',
    estadosSignificativos: 'Método de Estados Significativos',
  }), []);
  
  const [selectedMethod, setSelectedMethod] = useState('thompson');

  useEffect(() => {
    if (selectedMethod) {
      handleMethodSwitch(); 
    }
  }, [selectedMethod]);
  
  const handleMethodSwitch = async () => {
    //regex can not be empty
    if (!regex) {
      return;
    }

    setShowTable(false);
    setNfaTable(null);
    setSymbols([]);
    setTranD([]);
    setStates([]);
    setInitialState([]);
    setAcceptStates([]);
    
    const method_to_use = selectedMethod === "thompson" ? "thompson" :
                          selectedMethod === "subconjuntos" ? "subset" :
                          "optimize";

    const result = await handleAutomatonProcess(regex, method_to_use);

    if (result) {
      setSymbols(result.symbols);
      setTranD(result.TranD);
      setStates(result.States);
      setInitialState(result.initial_state);
      setAcceptStates(result.accept_states);
      setShowTable(true); 

      if (selectedMethod === "thompson") {
        setTransThomposn(result.transition_table);
        setNfaTable(result.transition_table);
      } else {
        setNfaTable(result.TranD);
      }

    } else {
      setError("Error processing the automaton.");
      setShowTable(false);
    }
  };

  const handleSelectMethod = (method) => {
    setSelectedMethod(method); 
    setShowTable(false);
    setNfaTable(null);
  };

  const handleInputChange = (event) => {
    setRegex(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateRegex()) return;
    handleMethodSwitch();  // Procesa el autómata al enviar
  };

  const validateRegex = () => {
    if (!regex) {
      setError("La expresión regular no puede estar vacía.");
      setShowTable(false);
      setNfaTable(null);
      return false;
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
      return false;
    }

    const invalidOr = /\|\||^\||\|$|\(\||\|\)/;
    if (invalidOr.test(regex)) {
      setError("El operador | requiere dos operandos.");
      setShowTable(false);
      setNfaTable(null);
      return false;
    }

    if (regex.includes('.')) {
      setError("La expresión no puede contener el carácter '.'");
      setShowTable(false);
      setNfaTable(null);
      return false;
    }

    const parentehsis = /\(\)/;
    if (parentehsis.test(regex)) {
      setError("La expresión no puede contener paréntesis vacíos.");
      setShowTable(false);
      setNfaTable(null);
      return false;
    }

    try {
      new RegExp(regex);
    } catch (e) {
      setError("La expresión regular ingresada no es válida.");
      setShowTable(false);
      setNfaTable(null);
      return false;
    }

    setError("");
    return true;
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
                disabled={selectedMethod === method} 
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

          {showTable && (
            <div className={styles.information}>
              {/* El componente Alphabet permanece visible siempre */}
              <Alphabet symbols={symbols} />

              {/* Renderiza el componente según el método seleccionado */}
              {selectedMethod === "thompson" && (
                <TransitionTable transitionTable={transThomposn} initial_state={initialStates} accept_states={acceptStates} />
              )}
              {selectedMethod === "subconjuntos" && (
                <Subset TranD={tranD} States={states} InitialState={initialStates} AcceptState={acceptStates} />
              )}
              {selectedMethod === "estadosSignificativos" && (
                <Optimize TranD={tranD} States={states} InitialState={initialStates} AcceptState={acceptStates} />
              )}
            </div>
          )}
        </div>

        {/* El componente Automata visualiza el autómata en base al método y los estados */}
        <Automata nfaTable={nfaTable} method={selectedMethod} initial_state={initialStates} accept_states={acceptStates} />
      </div>

      <footer className={styles.footer}>
        <p>&copy; 2024 Automata Visualizer. Desarrollado por: Ana Ardila, Luis Parra, Edgar Torres & Juan Vargas.</p>
      </footer>
    </div>
  );
}
