import { useState, useEffect } from "react";
import styles from "./component.module.css";

const Optimize = ({ TranD, States, InitialState, AcceptState }) => {
    console.log("TranDdddd", TranD);

    if (!TranD || !States) {
        return <div>Datos no disponibles</div>;
    }

    const transitionsMatrix = {};
    const statesInTransitions = new Set(); 

    TranD.forEach(transitionStr => {
        const match = transitionStr.match(/(\w+):\((\w+),(\w+)\)/);
        if (match) {
            const fromState = match[1];
            const symbol = match[2];
            const toState = match[3];

            // Add fromState and toState to the set
            statesInTransitions.add(fromState);
            statesInTransitions.add(toState);

            if (!transitionsMatrix[fromState]) {
                transitionsMatrix[fromState] = {};
            }
            transitionsMatrix[fromState][symbol] = toState;
        }
    });

    // Get unique symbols from TranD
    const symbols = Array.from(new Set(TranD.map(transitionStr => {
        const match = transitionStr.match(/:\((\w+),/);
        return match ? match[1] : null;
    }))).filter(Boolean);

   
    const allStates = Array.from(statesInTransitions);

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
                            {allStates.map((fromState) => {
                                // Check if the InitialState and AcceptState are lists
                                if (!Array.isArray(InitialState) || !Array.isArray(AcceptState)) {
                                    return; 
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
                                                    : "-"}  {/* Show "-" if no transition */}
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

export default Optimize;
