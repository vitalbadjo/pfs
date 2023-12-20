import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { reorder } from './utils/utils';
// import { orderById, swap, testData } from './utils/utils';

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
const testData = {
  "test1": { id: "test1", orderId: "1", o: 1 },
  "test2": { id: "test2", orderId: "2", o: 2 },
  "test3": { id: "test3", orderId: "3", o: 3 },
  "test4": { id: "test4", orderId: "4", o: 4 },
  "test5": { id: "test5", orderId: "5", o: 5 },
  "test6": { id: "test6", orderId: "6", o: 6 },
  "test7": { id: "test7", orderId: "7", o: 7 },
}

console.log("reorder", reorder(testData.test6.id, testData.test2.id, testData))