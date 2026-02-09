'use client'

import { useState } from 'react'

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from 'next-auth/react'
import { User } from "next-auth"
import axios from 'axios'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/ApiResponse'


const page = () => {
  const [message, setMessage] = useState<string>('')
  const [suggestions, setSugestions] = useState<string[]>([]);

  const {data: session} = useSession()
  const {username} = session?.user as User || "Undefined"

  const messageSubmitHandler = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        username: username,
        content: message
      })

      toast.success("Message has been sent!")
      setMessage('')
    } catch (error) {
      console.error("Error sending the message, ", error)
      toast.error("Message could not be delivered!")
    }
  }

  function extractAndParseQuestions(raw: string) {
  
    const match = raw.match(/"([\s\S]*?)"/);

    if (!match) return []; 

    const questionString = match[1]; 

    return questionString
      .replace(/\n+/g, " ")   
      .trim()
      .split("||")
      .map(q => q.trim())
      .filter(Boolean);
  }


  const suggestMessagesHandler = async () => {
    try {
      const response = await fetch('/api/suggest-message')

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      let rawText = ""

      while(true){
        const { done, value } = await reader!.read();
        if(done) break;

        const chunk = decoder.decode(value, {stream: true})

        const lines = chunk.split('\n')

        for(const line of lines){
          if(line.startsWith("data: ")){
            const json = JSON.parse(line.replace("data: ", ""))

            if(json.type === "text-delta"){
              rawText += json.delta
            }

            if(json.type === "finish"){
              const messages = extractAndParseQuestions(rawText)
              setSugestions(messages)
            }
          }
        }

      }
    } catch (error) {
      console.error("Error while getting suggestion: ", suggestions)
    }
  }


  return (
    <div>
      <div className='flex justify-center mt-8 mb-10'>
        <h2 className='font-extrabold text-4xl'>Public Profile Link</h2>
      </div>
      <div className="w-1/2 gap-3 justify-center mt-4 ml-[25%]">
        <p>Send annonymous text to @one</p>
        <Textarea placeholder="Type your message here." 
        value={message}
        onChange={(e) => {
          setMessage(e.target.value)
        }} />
        <Button className='mt-2 ml-[80%]' onClick={messageSubmitHandler}>Send message</Button>
      </div>
      <div className='mt-15 ml-[25%]'>
        <Button onClick={suggestMessagesHandler}> Suggest messages</Button>
        <p className='mt-5'>Click on any message below to select it.</p>
      </div>
      <div className="w-[50%] h-96 border border-gray-300 bg-white rounded ml-[25%] mt-5 p-3 overflow-y-auto">
      <h5 className="mb-3 font-semibold">Messages</h5>

      {suggestions.length === 0 ? (
        <p className="text-gray-400">No suggestions yet. Click “Suggest messages”.</p>
      ) : (
        <div className="grid gap-3">
          {suggestions.map((msg, i) => (
            <div
              key={i}
              className="border p-3 rounded cursor-pointer hover:bg-gray-100 transition"
              onClick={() => setMessage(msg)}   
            >
              {msg}
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  )
}

export default page
