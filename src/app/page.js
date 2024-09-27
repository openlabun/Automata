"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Automata from "./components/automata";
import TransitionTable from "./components/transitionTable";
import Alphabet from "./components/alphabet";

export default function Home() {
  const [regex, setRegex] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [error, setError] = useState("");
  const [postfix, setPostfix] = useState("");
  const [nfaTable, setNfaTable] = useState(null);
  const [status, setStatus] = useState("");
  const methodLabels = {
    thompson: 'Método de Thompson',
    subconjuntos: 'Método de Subconjuntos',
    estadosSignificativos: 'Método de Estados Significativos',
  };
  
  const [selectedMethod, setSelectedMethod] = useState('thompson');
  
  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
  };

  const handleInputChange = (event) => {
    setRegex(event.target.value);
    setNfaTable(null);
    setShowTable(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Validación de la expresión regular
    const regexPattern = /^[A-Za-z0-9|*+?()]*$/; // Permite letras, números y |, *, +, ?
  
    if (regex.trim() === "") {
      setError("La expresión regular no puede estar vacía.");
      setShowTable(false);
      setNfaTable(null);
      return;
    }
  
    if (!regexPattern.test(regex)) {
      setError("La expresión regular solo puede contener letras, números, y los símbolos: (, ), |, *, + y ?");
      setShowTable(false);
      setNfaTable(null);
      return;
    }
  
    // Comprobar si los paréntesis están balanceados
    const isBalanced = (str) => {
      let stack = [];
      for (let char of str) {
        if (char === "(") stack.push(char);
        else if (char === ")") {
          if (stack.length === 0) return false; // Paréntesis sin abrir
          stack.pop();
        }
      }
      return stack.length === 0; // Verificar si todos los paréntesis se cerraron
    };
  
    if (!isBalanced(regex)) {
      setError("Los paréntesis no están balanceados.");
      setShowTable(false);
      setNfaTable(null);
      return;
    }
  
    // Comprobar que operadores como *, +, ?, | estén bien ubicados
    const invalidOr = /([|]{2,})|(^[|])|([|]$)|([*+?]{1,})[|]/;
    if (invalidOr.test(regex)) {
      setError("El operador | requiere dos operandos.");
      setShowTable(false);
      setNfaTable(null);
      return;
    }

    // Comprobar si la expresión regular es válida usando new RegExp()
    try {
      new RegExp(regex); // Intentar compilar la expresión regular
    } catch (e) {
      setError("La expresión regular ingresada no es válida.");
      setShowTable(false);
      setNfaTable(null);
      return;
    }

    // Si todo está bien, no hay errores
    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          regex: regex,
          string: 'a',
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setPostfix(data.postfix);
        setNfaTable(data.nfa_table);
        setStatus(data.status);
        setShowTable(true);
      } else {
        setError(`Error: ${data.error}`);
      }
    } catch (error) {
      setError('Failed to process the regular expression.');
    }
  
    // Si todo está bien, no hay errores
    setError(""); // Limpiar mensaje de error
    setShowTable(true); // Mostrar tabla de transiciones o siguiente paso
  
    // Aquí puedes manejar la lógica para calcular las transiciones
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
            {showTable && <div><Alphabet nfaTable={nfaTable}/></div>}
            {showTable && <div><TransitionTable nfaTable={nfaTable}/></div>}
          </div>
        </div>
          <Automata nfaTable={nfaTable} regex={regex}/>
      </div>
      
      <footer className={styles.footer}>
        <p>&copy; 2024 Automata Visualizer. Desarrollado por: Ana ardila, Luis Parra, Edgar Torres & Juan Vargas.</p>
      </footer>
  
    </div>
  );
}
