import { useState, useEffect } from "react";
import styles from "./component.module.css";

const Subset = ({ TranD, States }) => {
    if (!TranD || !States) {
        return <div>Datos no disponibles</div>;
    }

    const symbols = Object.keys(TranD).reduce((acc, transition) => {
        const symbol = transition.split("->-")[1];
        if (!acc.includes(symbol)) {
            acc.push(symbol);
        }
        return acc;
    }, []);

    const transitionsMatrix = {};
    Object.entries(TranD).forEach(([transition, toState]) => {
        const fromState = transition.split("->")[0].replace(/->/g, ""); 
        const symbol = transition.split("->-")[1];
        if (!transitionsMatrix[fromState]) {
            transitionsMatrix[fromState] = {};
        }
        transitionsMatrix[fromState][symbol] = toState;
    });

    // Obtener los estados
    const allStates = Object.keys(States).map(state => state.replace(/\*|->/g, "")); 

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
                                {symbols.map((symbol) => (
                                    <th key={symbol}>{symbol}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {allStates.map((fromState) => (
                                <tr key={fromState}>
                                    <td>{fromState}</td>
                                    {symbols.map((symbol) => (
                                        <td key={`${fromState}-${symbol}`}>
                                            {transitionsMatrix[fromState]?.[symbol]
                                                ? transitionsMatrix[fromState][symbol].replace(/\*|->/g, "")
                                                : "-"}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tabla de Estados Equivalentes */}
            <div className={styles.equivalentStatesTable}>
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
