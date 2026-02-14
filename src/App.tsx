import SidePanel from './components/SidePanel'
import ChatWindow from './components/ChatWindow'

function App() {
  return (
    <div className="h-full flex bg-white">
      <SidePanel />
      <ChatWindow />
    </div>
  )
}

export default App
