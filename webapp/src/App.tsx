import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import Alert from './global/Alert'
import useGlobalStore from './global/GlobalStore'

function App() {
  const alerts = useGlobalStore((state) => state.alerts)

  return (
    <main>
      <Outlet />
      <div className="toast">
        {
          alerts.map(alertProps => ( 
            <Alert {...alertProps} /> 
          )) 
        }
      </div>
    </main>
  )
}

export default App
