# Automata Visualizer

![screenshot](https://github.com/Torrex123/Automata-Visualizer/blob/main/assets/demo.png)

Welcome to **Automata Visualizer**, an interactive tool that allows you to generate, visualize, and evaluate automata based on user-inputted regular expressions. This project provides a comprehensive visual experience, helping users understand how regular expressions translate into automata and how strings are evaluated against them through dynamic animations.

## 🎯 Project Overview

Automata Visualizer takes a regular expression input from the user and generates the corresponding automaton (NFA or DFA). Users can then test various strings against the automaton to see whether they are accepted or rejected, with an animated visual representation of the traversal.

### Key Features

- **Automata Generation**: Generate Non-Deterministic Finite Automata (NFA) and Deterministic Finite Automata (DFA) from regular expressions.
- **String Evaluation with Animation**: Enter a string and watch as the program dynamically animates the traversal of states, clearly indicating whether the string is accepted or rejected by the automaton.
- **Interactive Graphical Interface**: The automata are drawn and displayed using **Cytoscape**, providing an intuitive and engaging visual experience.

## 🚀 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) for a dynamic user experience.
- **Automata Visualization**: **Cytoscape.js** for rendering interactive and animated graph visualizations.
- **Backend**: Developed separately to handle the logic for processing regular expressions and generating the automaton.

## 📂 Project Structure

The project consists of a frontend deployed on Vercel and a separate backend repository:

- **Frontend**: The frontend is responsible for taking user inputs, rendering the visual components, and handling animations. It is built using Next.js and utilizes Cytoscape.js for drawing automata.
- **Backend**: The backend is developed independently to handle the computational logic for converting regular expressions into automata. It also processes string evaluations and returns results to the frontend for display.

## 🌐 Live Demo

The frontend is deployed on **Vercel**. You can access the live version here: [Automata Visualizer on Vercel](https://automata-visualizer.vercel.app/)

## 📁 Backend Repository

The backend logic and API endpoints are maintained in a separate repository. You can find it here: [AutomatonCraft](https://github.com/LuisangelParra/AutomatonCraft)
