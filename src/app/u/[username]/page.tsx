'use client'

import React, { useState } from 'react'

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from 'next-auth/react'
import { User } from "next-auth"
import axios from 'axios'
import { toast } from 'sonner'
import { ApiResponse } from '@/types/ApiResponse'


const page = () => {
  const [message, setMessage] = useState('')
  const [suggestions, setSugestions] = useState([]);

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

  const suggestMessagesHandler = async () => {
    try {
      
      const response = await axios.get<ApiResponse>('/api/suggest-message')
      console.log(response?.data)


    } catch (error) {
      console.error("Error while getting suggestions: ", error)
      toast.error("Could not get suggestions!")
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
      <div className='w-[50%] h-96 border border-gray-300 bg-white rounded ml-[25%] mt-5'>
        <h5 className='m-3'>Messages</h5>
      </div>
    </div>
  )
}

export default page
