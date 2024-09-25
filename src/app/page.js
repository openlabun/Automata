"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Automata from "./components/automata";

export default function Home() {
  const [regex, setRegex] = useState("");
  const [stringToEvaluate, setStringToEvaluate] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [error, setError] = useState("");
  const [postfix, setPostfix] = useState("");
  const [nfaTable, setNfaTable] = useState(null);
  const [status, setStatus] = useState("");

  const handleInputChange = (event) => {
    setRegex(event.target.value);
  };

  const handleStringChange = (event) => {
    setStringToEvaluate(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Validación de la expresión regular
    const regexPattern = /^[A-Za-z0-9|*+?()]*$/; // Permite letras, números y |, *, +, ?
  
    if (regex.trim() === "") {
      setError("La expresión regular no puede estar vacía.");
      setShowTable(false);
      return;
    }
  
    if (!regexPattern.test(regex)) {
      setError("La expresión regular solo puede contener letras, números, y los símbolos: (, ), |, *, + y ?");
      setShowTable(false);
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
      return;
    }
  
    // Comprobar que operadores como *, +, ?, | estén bien ubicados
    const invalidOr = /([|]{2,})|(^[|])|([|]$)|([*+?]{1,})[|]/;
    if (invalidOr.test(regex)) {
      setError("El operador | requiere dos operandos.");
      setShowTable(false);
      return;
    }

    // Comprobar si la expresión regular es válida usando new RegExp()
    try {
      new RegExp(regex); // Intentar compilar la expresión regular
    } catch (e) {
      setError("La expresión regular ingresada no es válida.");
      setShowTable(false);
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
          string: stringToEvaluate,
        }),
      });
  
      const data = await response.json();

      console.log(data);
  
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
        <h1>Automata Visualizer</h1>
      </header>
      
      <div className={styles.container}>
        <div className={styles.data}>
          <form onSubmit={handleSubmit}>
            <div className={styles.inputContainer}>
              <label className={styles.label} htmlFor="regex">
                Ingrese la expresión regular
              </label>
              <input
                type="text"
                className={styles.input}
                id="regex"
                name="regex"
                placeholder="Expresión regular"
                autoComplete="off"
                value={regex}
                onChange={handleInputChange}
              />
              <input
                className={styles.buttonsubmit}
                value="Comenzar"
                type="submit"
              />
              {error && <div className={styles.error}>{error}</div>}
            </div>
          </form>
        </div>
  
          <Automata />
        
      </div>
      
      <footer className={styles.footer}>
        <p>&copy; 2024 Automata Visualizer. All rights reserved.</p>
      </footer>
  
    </div>
  );
}
