// USE WITH RTQ (Currently not using)
// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
//
// export const assistantApi = createApi({
//     reducerPath: "assistantApi",
//     baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3001/api" }),    //main-backend
//     endpoints: (builder) => ({
//         sendMessage: builder.mutation<{ message: string, context: string[], timestamp: string }, { message: string, conversationId?: number }>({
//             query: (payload) => ({
//                 url: "/assistant/chat",
//                 method: "POST",
//                 body: payload
//             })
//         })
//     })
// })
//
// export const { useSendMessageMutation } = assista