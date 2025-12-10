import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { ApiException, fromHono } from "chanfana";
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { Hono } from "hono";
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';

import { CheckoutSession, checkoutSessions } from './db/schema';
import { listCheckoutSessions } from './db/queries/sessions';
import authors from './endpoints/author';
import sessions from './endpoints/sessions/router';
import { prettyJSON } from 'hono/pretty-json'
import { openAPIRouteHandler } from 'hono-openapi'


import { ContentfulStatusCode } from 'hono/utils/http-status';
import books from './endpoints/books';
import { createFactory } from 'hono/factory';

// 1) Define the users table
const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});

type Env = {
  Bindings: {
    DB: D1Database
  }
  Variables: {
    db: DrizzleD1Database
  }
}

const factory = createFactory<Env>({
  initApp: (app) => {
    app.use(async (c, next) => {
      const db = drizzle(c.env.DB)
      c.set('db', db)
      await next()
    })
  },
})
// ...

// Set the `Env` to `createFactory()`
const app = factory.createApp()




app.onError((err, c) => {
  if (err instanceof ApiException) {
    // If it's a Chanfana ApiException, let Chanfana handle the response
    return c.json(
      { success: false, errors: err.buildResponse() },
      err.status as ContentfulStatusCode,
    );
  }

  console.error("Global error handler caught:", err); // Log the error if it's not known

  // For other errors, return a generic 500 response
  return c.json(
    {
      success: false,
      errors: [{ code: 7000, message: "Internal Server Error" }],
    },
    500,
  );
});
app.use(logger())
app.use(prettyJSON())
app.use('/*', cors({
  origin: '*',
  allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}))



app.route('/authors', authors)
app.route('/books', books)
app.route('/sessions', sessions)
export default app
// export default {
//   async fetch(request: Request, env: Env) {
//     const db = drizzle(env.DB);

//     const url = new URL(request.url);

//     // Route to create the users table if it doesn't exist
//     if (url.pathname === '/setup') {
//       //
//       return new Response('Table created or already exists!');
//     }
//     if (url.pathname === '/checkout-session') {
//       if (request.method === 'POST') {
//         const body = await request.json() as CheckoutSession;
//         console.log('body', body);
//         const checkoutSession = await db.insert(checkoutSessions).values(body).returning();
//         return Response.json(checkoutSession);
//       }
//       if (request.method === 'GET') {
//         const allCheckoutSessions = await listCheckoutSessions(db, 20, 0);
//         return Response.json(allCheckoutSessions);
//       }
//     }


//     // Route to add a test user
//     if (url.pathname === '/add') {
//       const newUser = await db.insert(users)
//         .values({ name: 'Test User' })
//         .returning()
//         .get();

//       return Response.json(newUser);
//     }

//     // Route to get all users
//     if (url.pathname === '/users') {
//       const allUsers = await db.select().from(users).all();
//       return Response.json(allUsers);
//     }

//     // Default route
//     return new Response('D1 Connected!');
//   },
// };