// Runs in TBS, not in the browser. Only ctx is available: ctx.user, ctx.db, ctx.log.
export default {
  routes: {
    "POST /notes": async (ctx, req) => {
      const text = String(req.body && req.body.text ? req.body.text : "").slice(0, 1000);
      if (!text) throw new Error("text is required");
      const record = await ctx.db.append("notes", { text });
      return { revision: record.revision };
    },
    "GET /notes": async (ctx) => {
      const notes = await ctx.db.list("notes");
      return { notes: notes.map((n) => n.data) };
    },
  },
};
