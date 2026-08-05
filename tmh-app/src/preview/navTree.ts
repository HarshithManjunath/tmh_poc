export interface NavNode {
  key: string
  pageIndex: number
  title: string
  page: any
  panel?: any        // selected panel object, or undefined for page-level content
  panelIndex?: number
  children?: NavNode[]
}

function panelToNode(pageIndex: number, panel: any, idx: number): NavNode {
  return {
    key: `page-${pageIndex}-panel-${idx}`,
    pageIndex,
    title: panel.title ?? panel.name ?? `Subsection ${idx + 1}`,
    page: null,
    panel,
    panelIndex: idx,
  }
}

export function buildNavTree(pages: any[]): NavNode[] {
  return pages.map((page, pageIndex) => {
    const panels = (page.elements ?? []).filter((el: any) => el && el.type === 'panel')
    const children = panels.map((p: any, idx: number) => panelToNode(pageIndex, p, idx))
    return {
      key: `page-${pageIndex}`,
      pageIndex,
      title: page.title ?? page.name ?? `Section ${pageIndex + 1}`,
      page,
      panel: undefined,
      children,
    }
  })
}
