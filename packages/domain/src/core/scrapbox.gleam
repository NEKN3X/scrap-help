import core/simple
import gleam/option

pub type ScrapboxProject {
  ScrapboxProject(name: simple.ScrapboxProjectName)
}

pub type ScrapboxPage {
  ScrapboxPage(
    id: simple.ScrapboxId,
    title: simple.ScrapboxPageTitle,
    image: option.Option(simple.ScrapboxPageImage),
    created: simple.ScrapboxTimestamp,
    updated: simple.ScrapboxTimestamp,
    helpfeels: List(simple.ScrapboxPageText),
    lines: List(ScrapboxLine),
  )
}

pub type ScrapboxLine {
  ScrapboxLine(id: simple.ScrapboxId, text: simple.ScrapboxPageText)
}
