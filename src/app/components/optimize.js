import { useState, useEffect } from "react";
import styles from "./component.module.css";

const Optimize = ({ TranD, States, InitialState, AcceptState }) => {

    if (!TranD || !States) {
        return <div>Datos no disponibles</div>;
    }

    const transitionsMatrix = {};
    const statesInTransitions = new Set();

    TranD.forEach(transitionStr => {
        const match = transitionStr.match(/(\w+):\(\s*([^,]*)\s*,\s*(\w+)\s*\)/);
        if (match) {
            const fromState = match[1];
            const symbol = match[2].trim() || ",";
            const toState = match[3];

            statesInTransitions.add(fromState);
            statesInTransitions.add(toState);

            if (!transitionsMatrix[fromState]) {
                transitionsMatrix[fromState] = {};
            }
            transitionsMatrix[fromState][symbol] = toState;
        }
    });

    const symbols = Array.from(new Set(TranD.map(transitionStr => {
        const match = transitionStr.match(/\(\s*([^,]*)\s*,/);
        return match ? match[1].trim() || "," : null;
    }))).filter(Boolean);

    const allStates = Array.from(statesInTransitions);
    const equivalenceMap = new Map();

    Object.entries(States).forEach(([state, equivalents]) => {
        const key = equivalents.sort().join(",");
        if (!equivalenceMap.has(key)) {
            equivalenceMap.set(key, []);
        }
        equivalenceMap.get(key).push(state);
    });

    // Filtrar solo los grupos con más de un estado (estados idénticos)
    const identicalStates = Array.from(equivalenceMap.entries())
        .filter(([, group]) => group.length > 1)
        .map(([key, group]) => (
            <p key={key}>
                {group.join(", ")}
            </p>
        ));

    return (
        <>
            {/* Transitions Table */}
            <div className={styles.transitionsTable}>
                <h2>Transiciones del Autómata</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Estado</th>
                                {symbols.map((symbol) => (
                                    <th key={symbol}>
                                        {symbol === "," ? " " : symbol} 
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

            {/* Equivalent States Table */}
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

            {identicalStates.length > 0 && (
            <div className={styles.identicalStatesSection}>
                <h2 className={styles.title}>Estados Idénticos</h2>
                <ul className={styles.list}>
                    {identicalStates.map((state, index) => (
                        <p key={index} className={styles.listItem}>{state}</p>
                    ))}
                </ul>
            </div>
            )}
        </>
    );
};

export default Optimize;
