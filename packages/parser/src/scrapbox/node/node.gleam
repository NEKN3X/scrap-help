pub type Options {
  Options(nested: Bool, quoted: Bool, table: Bool)
}

pub type Node {
  Plain(String)
  Blank(raw: String, content: String)
  Code(raw: String, content: String)
  CommandLine(raw: String, symbol: String, content: String)
  ExternalLink(raw: String, href: String, content: String)
  Deco(raw: String, content: List(Node))
}
