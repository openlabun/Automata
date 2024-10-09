import { useState, useEffect, useMemo } from "react";
import styles from "./component.module.css";

const Alphabet = ({ symbols }) => {

    const [alphabet, setAlphabet] = useState([]);   
    
    const filteredSymbols = useMemo(() => {
        return symbols.filter(symbol => symbol !== '&');
    }, [symbols]);  
    useEffect(() => {
        setAlphabet(filteredSymbols);
    }, [filteredSymbols]);  
    return (
        <div className={styles.transitionsTable}>
            <h2>Alfabeto</h2>
            <div className={styles.Alphabet}>
                𝛴 = <span>{`{ ${alphabet.join(', ')} }`}</span>
            </div>
        </div>
    );
};

export default Alphabet;
