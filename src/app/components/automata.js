import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import dagre from 'cytoscape-dagre';
import styles from "./component.module.css";
import styles2 from "/src/app/page.module.css";
import { handleAutomatonEvaluate } from "@/dataRetriever/data";

cytoscape.use(dagre);

const Automata = ({ nfaTable, method, initial_state, accept_states }) => {
  
  const cyContainer = useRef(null);
  const cyRef = useRef(null); 
  const [stringToEvaluate, setStringToEvaluate] = useState("");
  const [triggerAnimation, setTriggerAnimation] = useState(false); // Trigger the animation when the 'evaluar' button is clicked
  const [isAnimating, setIsAnimating] = useState(false); // Animation status
  const [isDisabled, setIsDisabled] = useState(true); // Disable input and button while animating
  const [accepted, setAccepted] = useState(null); // Accepted status of the string
  const [paths, setPaths] = useState([]);
  const [abortController, setAbortController] = useState(null); 

  const handleStringInputChange = (event) => {
    setStringToEvaluate(event.target.value);
    setAccepted(null);
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort(); 
    }
    setIsAnimating(false);
    setIsDisabled(false);
    setAccepted(null);
    setPaths([]); 
    cyRef.current.elements().removeClass("highlighted"); 
  };

  const evaluate = async () => {

    const method_to_use = method === "thompson" ? "thompson" : 
                      method === "subconjuntos" ? "subset" : 
                      "optimize";

    const sanitizeString = (input) => {

      let cleanedString = input.replace(/&/g, "");
  
      cleanedString = cleanedString.replace(/&{2,}/g, '&');
  
      return cleanedString || "&";
    };

    const sanitizedString = sanitizeString(stringToEvaluate);
    
    const evaluationResult = await handleAutomatonEvaluate(method_to_use, sanitizedString);

    if (!evaluationResult) {
        return {
            status: false,
            paths: [],
        };
    }

    const { status, paths } = evaluationResult;

    let string_status = false;

    if (method === "thompson") {
        string_status = status === 'Aceptada'; 
    } else {
        string_status = status;
    }

    return {
        status: string_status,
        paths: paths,
    };
  };

  const handleSubmit = async (event) => {

    event.preventDefault();

    const { status, paths } = await evaluate();

    setAccepted(status);
    setPaths(paths);
    setTriggerAnimation(prev => !prev); 
    setIsAnimating(true);
    setIsDisabled(true);
  };

  useEffect(() => {

    if (!nfaTable) {
      setAccepted(null); 
      if (abortController) {
        abortController.abort();
      }
      setIsDisabled(true);
      setIsAnimating(false);
      setStringToEvaluate("");
      return
    };

    const elements = [];
    const visitedNodes = new Set();
    let firstState = null;
    setIsDisabled(false);

    if(method === "thompson") {

      // nfatable validation format for thompson
      const isValidFormat = Object.values(nfaTable).every(state =>
          typeof state === 'object' &&
          !Array.isArray(state) &&
          Object.values(state).every(transitionTargets =>
              Array.isArray(transitionTargets)
          )
      );

      if (!isValidFormat) {
          console.warn("El formato de nfaTable no es válido.");
          return; 
      }

      Object.keys(nfaTable).forEach((state, index) => {
        if (state == initial_state && firstState == null) {
          firstState = state;
          elements.push({ data: { id: "start", label: "Start" }, classes: "start" });
          elements.push({
            data: { source: "start", target: state, label: "" },
          });
        }

        if (!visitedNodes.has(state)) {
          const classes = state === accept_states ? "final" : ""; 
          elements.push({ data: { id: state, label: state }, classes });  
          visitedNodes.add(state);
      }

        Object.entries(nfaTable[state]).forEach(([transition, targets]) => {
          targets.forEach((target) => {
            elements.push({
              data: { source: state, target: target.toString(), label: transition },
            });

            if (!visitedNodes.has(target)) {

              const classes = target === accept_states ? "final" : ""; // Clase para el estado final

              elements.push({ data: { id: target.toString(), label: target.toString() }, classes });  
              visitedNodes.add(target);
            }
          });
        });
      });
    
    } else {
      
      // nfatable validation format for subset and optimize
      const isInvalidFormat = (table) => {
          if (typeof table === 'object' && table !== null) {
              // Check if the table has at least one state with transitions
              return Object.values(table).some(
                  transitions => typeof transitions === 'object' && transitions !== null && Object.values(transitions).some(Array.isArray)
              );
          }
          return false;
      };
    
      if (isInvalidFormat(nfaTable)) {
          return;  
      }

      // Nueva condición para dibujar solo el nodo de inicio
      if (nfaTable.length === 0) {
        const startState = initial_state[0];
        elements.push({ data: { id: "start", label: "Start" }, classes: "start" });
        elements.push({
            data: { source: "start", target: startState, label: "" }, // Cambié 'startState' a startState
        });
        elements.push({ data: { id: startState, label: startState }, classes: accept_states.includes(startState) ? "final" : "" });
      } else {

        nfaTable.forEach(transitionStr => {
          const match = transitionStr.match(/(\w+):\(\s*(.*?)\s*,\s*(\w+)\s*\)/);

          if (match) {
              const state = match[1];      // The state (e.g., "A")
              const transition = match[2];  // The transition symbol (e.g., "a")
              const target = match[3];      // The target state (e.g., "B")
      
              if (initial_state.includes(state) && firstState === null) {
                  firstState = state;
                  elements.push({ data: { id: "start", label: "Start" }, classes: "start" });
                  elements.push({
                      data: { source: "start", target: state, label: "" },
                  });
              }
      
              if (!visitedNodes.has(state)) {
                  const classes = accept_states.includes(state) ? "final" : "";  
                  elements.push({ data: { id: state, label: state }, classes }); 
                  visitedNodes.add(state);
              }
      
              elements.push({
                  data: { source: state, target: target, label: transition },
              });
      
              if (!visitedNodes.has(target)) {
                  const classes = accept_states.includes(target) ? "final" : "";  
                  elements.push({ data: { id: target, label: target }, classes });  
                  visitedNodes.add(target);
              }
          }
        });
      } 
    }

    const cy = cytoscape({
      container: cyContainer.current,
      elements: elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "transparent",
            label: "data(id)",
            "text-valign": "center",
            "text-halign": "center",
            "border-width": 2,
            "border-color": "#fff",
            "shape": "ellipse",
            "width": "40px",
            "height": "40px",
            "font-size": "15px",
            "text-outline-width": 2,
            "text-outline-color": "#fff",
          },
        },
        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": "#fff",
            "target-arrow-color": "#fff",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": "20px",
            "text-background-color": "transparent",
            "text-background-opacity": 0,
            "text-margin-y": -15,
            "text-border-width": 4,
            color: "#fff",
          },
        },
        {
          selector: ".start",
          style: {
            "background-color": "transparent",
            "border-width": 0,
            "shape": "roundrectangle",
            "text-outline-width": 0,
            opacity: 0,
          },
        },
        {
          selector: ".final",
          style: {
              "border-width": 5,             
              "border-color": "#00ff00",    
              "background-color": "transparent", 
              "shape": "ellipse",             
          },
      },
        {
          selector: ".highlighted", 
          style: {
            "background-color": "yellow",
            "line-color": "yellow",
            "target-arrow-color": "yellow",
          },
        },
      ],
      layout: {
        name: 'dagre',
        directed: true,
        padding: 10,
        fit: true,
        rankDir: 'LR',
        avoidOverlap: true,
      },
      zoom: 1,
      minZoom: 0.5,
      maxZoom: 3,
      wheelSensitivity: 0.1,
    });

    cy.on('layoutstop', () => {
      cy.fit();
    });

    cyRef.current = cy; 

    return () => cy.destroy();
  }, [nfaTable]);

  useEffect(() => {
    const animatePath = async () => {
      if (!cyRef.current) return;
  
      const controller = new AbortController();
      setAbortController(controller);
  
      try {
    
        if (paths.length === 0) {
          // Find the node with label 'A'
          const targetNode = cyRef.current.nodes().filter((node) => node.data('label') === 'A')[0]; 

          if (targetNode) {
            targetNode.addClass("highlighted");
            await new Promise((resolve) => setTimeout(resolve, 600));
            targetNode.removeClass("highlighted");
          }
          return; 
        }
  
        let pathToAnimate;
  
        if (method === "thompson") {

          function removeSubPaths(paths) {
            function isSubset(path1, path2) {
                return path1.every((value, index) => value === path2[index]);
            }
            
            const uniquePaths = new Map();
            
            // Filtrar caminos duplicados y mantener solo el primero
            paths.forEach((currentPath) => {
                const caminoKey = JSON.stringify(currentPath.camino);
                if (!uniquePaths.has(caminoKey)) {
                    uniquePaths.set(caminoKey, currentPath);
                }
            });
    
            const filteredPaths = Array.from(uniquePaths.values()).filter((currentPath, index, array) => {
                // Check if the current path is a subset of any other path
                const isSubsetOfAnotherPath = array.some((otherPath, otherIndex) => {
                    if (index !== otherIndex) {
                        return isSubset(currentPath.camino, otherPath.camino);
                    }
                    return false;
                });
    
                // If it is a subset, check if it's accepted or not
                if (isSubsetOfAnotherPath) {
                    return !array.some((otherPath, otherIndex) => {
                        return (
                            index !== otherIndex &&
                            isSubset(currentPath.camino, otherPath.camino) &&
                            otherPath.aceptado
                        );
                    });
                }
    
                // If it's not a subset, keep it
                return true;
            });
    
            // Eliminar caminos que son subconjuntos de cualquier otro camino aceptado
            const finalFilteredPaths = filteredPaths.filter(currentPath => {
                return !filteredPaths.some(otherPath => {
                    return (
                        currentPath !== otherPath &&
                        isSubset(currentPath.camino, otherPath.camino)
                    );
                });
            });
    
            return finalFilteredPaths;
          }
    
          const filteredPaths = removeSubPaths(paths);

          let foundAcceptedPath = false;
          for (const path of filteredPaths) {
          pathToAnimate = path.camino;

          if (path.aceptado) {
            foundAcceptedPath = true;
          }

          for (let i = 0; i < pathToAnimate.length - 1; i++) {
            if (controller.signal.aborted) throw new Error("Animation aborted");

            const currentState = pathToAnimate[i];
            const nextState = pathToAnimate[i + 1];

            const currentNode = cyRef.current.$(`#${currentState}`);
            const edge = cyRef.current.edges(
              `[source = "${currentState}"][target = "${nextState}"]`
            );

            currentNode.addClass("highlighted");
            await new Promise((resolve) => setTimeout(resolve, 600));
            if (controller.signal.aborted) throw new Error("Animation aborted");

            edge.addClass("highlighted");
            currentNode.removeClass("highlighted");

            await new Promise((resolve) => setTimeout(resolve, 600));
            if (controller.signal.aborted) throw new Error("Animation aborted");
            edge.removeClass("highlighted");
          }

          const finalNode = cyRef.current.$(
            `#${pathToAnimate[pathToAnimate.length - 1]}`
          );
          finalNode.addClass("highlighted");

          await new Promise((resolve) => setTimeout(resolve, 500));
          if (controller.signal.aborted) throw new Error("Animation aborted");
          finalNode.removeClass("highlighted");

          if (foundAcceptedPath) break;
          }

        } else {
          pathToAnimate = paths;

          const [currentState, input, nextStates] = pathToAnimate[0];

          if(!nextStates || !input){
            const currentNode = cyRef.current.$(`#${currentState}`);
            currentNode.addClass("highlighted");
            await new Promise((resolve) => setTimeout(resolve, 600));
            if (controller.signal.aborted) throw new Error("Animation aborted");
            currentNode.removeClass("highlighted");
          }else{

            for (let i = 0; i < pathToAnimate.length; i++) {
              if (controller.signal.aborted) throw new Error("Animation aborted");
            
              const [currentState, input, nextStates] = pathToAnimate[i];
              const currentNode = cyRef.current.$(`#${currentState}`);
              const edge = cyRef.current.edges(
                `[source = "${currentState}"][target = "${nextStates[0]}"][label = "${input}"]`
              );
              currentNode.addClass("highlighted");
          
              await new Promise((resolve) => setTimeout(resolve, 600));
              if (controller.signal.aborted) throw new Error("Animation aborted");
          
              currentNode.removeClass("highlighted");
              edge.addClass("highlighted");
          
              await new Promise((resolve) => setTimeout(resolve, 600));
              if (controller.signal.aborted) throw new Error("Animation aborted");
                edge.removeClass("highlighted");
              }
  
              const finalNode = cyRef.current.$(
                `#${pathToAnimate[pathToAnimate.length - 1][2][0]}`
              );
              finalNode.addClass("highlighted");
      
              await new Promise((resolve) => setTimeout(resolve, 500));
              if (controller.signal.aborted) throw new Error("Animation aborted");
      
              finalNode.removeClass("highlighted");

          }
        }

      } catch (error) {
        if (error.message !== "Animation aborted") {
          console.error(error);
        }
      } finally {
        setIsAnimating(false);
        setAccepted(null);
        setAbortController(null);
        setIsDisabled(false);
      }
    };
  
    if (isAnimating) {
      animatePath();
    }
  }, [triggerAnimation]);
  
  return (
    <div className={styles.automatacontainer}>
      <div className={styles.infoContainer}>
        <div className={styles2.inputContainer}>
          <input
            type="text"
            className={`${styles.input} ${isDisabled ? styles.disabled : ''}`} 
            id="regex"
            name="regex"
            placeholder="Ingrese cadena a evaluar..."
            autoComplete="off"
            value={stringToEvaluate} 
            onChange={handleStringInputChange}
            disabled={isDisabled} 
          />
          <input
            className={`${styles.buttonsubmit} ${isDisabled ? styles.disabled : ''}`} 
            value="Evaluar"
            type="submit"
            onClick={handleSubmit}
            disabled={isDisabled} 
          />
        </div>

        <div className={styles.acceptance}
            style={{
              borderColor: accepted === true ? 'green' : accepted === false ? 'red' : 'grey',
              boxShadow: accepted === true ? '0 0 10px green' : accepted === false ? '0 0 10px red' : '0 0 10px grey',
            }}>
          <div className={styles.option}>
            <span
              className={styles.indicator}
              style={{ backgroundColor: accepted === true ? 'green' : 'grey' }}
            ></span>
            <span className={styles.text} 
            id="accepted"
            style={{ color: accepted === true ? 'green' : 'grey' }}>Aceptado</span>
          </div>
          <div className={styles.option}>
            <span
              className={styles.indicator}
              style={{ backgroundColor: accepted === false ? 'red' : 'grey' }}
            ></span>
            <span className={styles.text} 
            id="rejected"
            style={{ color: accepted === false ? 'red' : 'grey' }}>Rechazado</span>
          </div>
        </div>
      </div>

      <div
        ref={cyContainer}
        style={{ width: "100%", height: "100%" }}
      ></div>
      {isAnimating && (
        <button onClick={handleCancel} className={styles.cancelButton}>
          Cancelar Evaluación
        </button>
      )}
    </div>
  );
};

export default Automata;
