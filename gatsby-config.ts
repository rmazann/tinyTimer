import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    title: `Vingt-Cinq`,
    description: `A minimalistic 25-minute Pomodoro timer`,
    author: ``,
  },
  plugins: [
    `gatsby-plugin-postcss`,
  ],
}

export default config

