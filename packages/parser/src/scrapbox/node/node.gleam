pub type Options {
  Options(nested: Bool, quoted: Bool, table: Bool, start: Bool)
}

pub fn default_options() {
  Options(False, False, False, False)
}

pub type Node {
  Plain(String)
  Blank(raw: String, content: String)
  Code(raw: String, content: String)
  CommandLine(raw: String, symbol: String, content: String)
  ExternalLink(raw: String, href: String, content: String)
  Formula(raw: String, content: String)
  HashTag(raw: String, content: String)
  Deco(raw: String, content: List(Node))
}
