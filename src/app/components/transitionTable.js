import { useState, useEffect, useMemo } from "react";
import styles from "./component.module.css";

const TransitionTable = ({transitionTable, initial_state, accept_states }) => {

    const [states, setStates] = useState([]);
    const [symbols, setSymbols] = useState([]);
    const [transitionsMatrix, setTransitionsMatrix] = useState({});

    useEffect(() => {
        const allStates = new Set();
        Object.keys(transitionTable).forEach((key) => {
            allStates.add(parseInt(key)); 
            Object.values(transitionTable[key]).forEach(destinations => {
                destinations.forEach(state => {
                    allStates.add(state); 
                });
            });
        });

        const allSymbols = new Set();
        Object.values(transitionTable).forEach(transitions => {
            Object.keys(transitions).forEach(symbol => {
                allSymbols.add(symbol);
            });
        });

        const matrix = {};
        allStates.forEach((state) => {
            matrix[state] = {};
            [...allSymbols].forEach((symbol) => {
                // If the state has transitions for the symbol, join them with commas
                matrix[state][symbol] = transitionTable[state]?.[symbol] ? transitionTable[state][symbol].join(", ") : "-";
            });
        });

        setStates([...allStates]);
        setSymbols([...allSymbols]);
        setTransitionsMatrix(matrix);
    }, [transitionTable]);

    const formatStateLabel = (state) => {
        const stateNumber = Number(state);

        let label = stateNumber;
        if (stateNumber === initial_state) label = `-> ${label}`;
        if (Array.isArray(accept_states) ? accept_states.includes(stateNumber) : stateNumber === accept_states) {
            label = `* ${label}`;
        }

        return label;
    };

    // Memoize transitionsMatrix, states, and symbols
    const memoizedTransitionsMatrix = useMemo(() => transitionsMatrix, [transitionsMatrix]);
    const memoizedStates = useMemo(() => states, [states]);
    const memoizedSymbols = useMemo(() => symbols, [symbols]);

    return (
        <div className={styles.transitionsTable}>
            <h2>Transiciones del Autómata</h2>
            <div className={styles.wrapper}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Estado</th>
                                {memoizedSymbols.map((symbol) => (
                                    <th key={symbol}>{symbol}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {memoizedStates.map((fromState) => (
                                <tr key={fromState}>
                                    <td>{formatStateLabel(fromState)}</td>
                                    {memoizedSymbols.map((symbol) => (
                                        <td key={`${fromState}-${symbol}`}>
                                            {memoizedTransitionsMatrix[fromState]?.[symbol] || "-"}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TransitionTable;
