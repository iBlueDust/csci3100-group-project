// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"

type Data = string

function GET(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  res.status(200).send("Pong!")
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  switch (req.method) {
    case "GET":
      GET(req, res)
      break
    default:
      res.status(405).end() // Method Not Allowed
  }
}
