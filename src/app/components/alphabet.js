import { useState } from "react";
import styles from "./component.module.css";

const Alphabet = () => {
    const alphabet = ['a', 'b', 'ε', '0', '1']; // Example alphabet

    return (
        <div className={styles.Alphabet}>
            <div>
                Alfabeto: <span>{`{ ${alphabet.join(', ')} }`}</span>
            </div>
        </div>
    );
};

export default Alphabet;
