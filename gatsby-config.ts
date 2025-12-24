import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    title: `Tiny Timer`,
    description: `A minimalistic 25-minute Pomodoro timer`,
    author: ``,
  },
  plugins: [
    `gatsby-plugin-postcss`,
  ],
}

export default config

