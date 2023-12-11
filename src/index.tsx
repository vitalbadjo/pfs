import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { orderById } from './utils/utils';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
const testData = [
  { id: "dsa", order: "asd", o: 4 },
  { id: "ewq", order: "qwe", o: 2 },
  { id: "qwe", order: undefined, o: 1 },
  { id: "cxz", order: "zxc", o: 6 },
  { id: "fff", order: "undefined", o: 0 },
  { id: "asd", order: "ewq", o: 3 },
  { id: "zxc", order: "dsa", o: 5 },
]

console.log(orderById(testData))