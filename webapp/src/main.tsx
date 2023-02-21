import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App'
import Editor from './editor/Editor'
import { ThreeTest } from './editor/ThreeCanvas'
import './main.css'

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="editor" element={<Editor />} />
        <Route path="test" element={<ThreeTest />} />
        <Route path="*" element={
          <div>
            404
          </div>
        } />
      </Route>
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
)
