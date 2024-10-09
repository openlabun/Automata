import { useState, useEffect } from "react";
import styles from "./component.module.css";

const Subset = ({ TranD, States, InitialState, AcceptState }) => {

    if (!TranD || !States) {
        return <div>Datos no disponibles</div>;
    }

    const transitionsMatrix = {};

    TranD.forEach(transitionStr => {
        const match = transitionStr.match(/(\w+):\(\s*([^,]*)\s*,\s*(\w+)\s*\)/);

        if (match) {
            const fromState = match[1];
            const symbol = match[2].trim();  
            const toState = match[3];

            if (!transitionsMatrix[fromState]) {
                transitionsMatrix[fromState] = {};
            }
            transitionsMatrix[fromState][symbol || " "] = toState;
        }
    });

    const symbols = Array.from(new Set(TranD.map(transitionStr => {
        const match = transitionStr.match(/\(\s*([^,]*)\s*,\s*/);
        const symbol = match ? match[1].trim() : null;
        return symbol === "" ? " " : symbol;  
    }))).filter(Boolean);

    const allStates = Object.keys(States);

    return (
        <>
            {/* Tabla de Transiciones */}
            <div className={styles.transitionsTable}>
                <h2>Transiciones del Autómata</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Estado</th>
                                {symbols.map((symbol, index) => (
                                    <th key={index}>
                                        {symbol === "[empty]" ? "[Espacio]" : symbol}
                                    </th>
                                ))} 
                            </tr>
                        </thead>
                        <tbody>
                            {allStates.map((fromState) => {
                                
                                if (!Array.isArray(InitialState) || !Array.isArray(AcceptState)) {
                                    return null; 
                                }

                                const isInitialState = InitialState.includes(fromState);
                                const isAcceptState = AcceptState.includes(fromState);

                                const displayState = `${isInitialState ? "-> " : ""}${isAcceptState ? "* " : ""}${fromState}`;

                                return (
                                    <tr key={fromState}>
                                        <td>{displayState}</td>
                                        {symbols.map((symbol) => (
                                            <td key={`${fromState}-${symbol}`}>
                                                {transitionsMatrix[fromState]?.[symbol] 
                                                    ? transitionsMatrix[fromState][symbol].replace(/\*|->/g, "") 
                                                    : "-"}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tabla de Estados Equivalentes */}
            <div className={styles.statesTable}>
                <h2>Estados Equivalentes</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Estado</th>
                                <th>Estados Equivalentes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(States).map(([state, equivalents]) => {
                                const equivalentStates = equivalents.map(equivalent => 
                                    equivalent.toString().replace(/\*|->/g, "")
                                ).join(", ");
                                return (
                                    <tr key={state}>
                                        <td>{state.replace(/\*|->/g, "")}</td>
                                        <td>{`{ ${equivalentStates} }`}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Subset;
