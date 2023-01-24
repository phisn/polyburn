import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App'
import Editor from './components/editor/Editor'
import Home from './pages/Home'
import Play from './pages/Play'
import './main.css'

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />}/>
        <Route path="play" element={<Play />} />
        <Route path="editor" element={<Editor />} />
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
