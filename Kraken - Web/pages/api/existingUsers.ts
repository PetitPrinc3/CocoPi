import { NextApiRequest, NextApiResponse } from "next";
import prismadb from '@/lib/prismadb';
import serverAuth from '@/lib/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { currentUser }: any = await serverAuth(req, res);

    if (req.method == "GET") {
        try {
            const existingUser = await prismadb.user.findMany({
                where: {
                    NOT: {
                        roles: ""
                    }
                }
            });

            return res.status(200).json(existingUser);

        } catch (error) {
            console.log(error);
            return res.status(400).end()
        }
    }

    if (req.method == "PUT") {
        return res.status(405).end()
    }

    if (req.method == 'DELETE') {
        try {
            await serverAuth(req, res);
            const { userId } = req.body;

            const user = await prismadb.user.delete({
                where: {
                    id: userId,
                }
            })

            return res.status(200).json(user)
        } catch (error) {
            console.log(error);
            return res.status(400).end()
        }
    }

    res.status(405).end()
}