export interface NavNode {
  key: string
  pageIndex: number
  title: string
  page: any
  panel?: any        // selected panel object, or undefined for page-level content
  panelIndex?: number
  depth: number
  children?: NavNode[]
}

function panelToNode(pageIndex: number, panel: any, idx: number, depth: number): NavNode {
  const nested = (panel.elements ?? []).filter((el: any) => el && el.type === 'panel')
  const children = nested.map((p: any, i: number) => panelToNode(pageIndex, p, i, depth + 1))
  return {
    key: `page-${pageIndex}-panel-${depth}-${idx}`,
    pageIndex,
    title: panel.title ?? panel.name ?? `Subsection ${idx + 1}`,
    page: null,
    panel,
    panelIndex: idx,
    depth,
    children: children.length ? children : undefined,
  }
}

export function buildNavTree(pages: any[]): NavNode[] {
  return pages.map((page, pageIndex) => {
    const panels = (page.elements ?? []).filter((el: any) => el && el.type === 'panel')
    const children = panels.map((p: any, idx: number) => panelToNode(pageIndex, p, idx, 1))
    return {
      key: `page-${pageIndex}`,
      pageIndex,
      title: page.title ?? page.name ?? `Section ${pageIndex + 1}`,
      page,
      panel: undefined,
      depth: 0,
      children: children.length ? children : undefined,
    }
  })
}

export function nodeAtPath(nav: NavNode[], path: number[]): NavNode | null {
  const [pi] = path
  if (!nav[pi]) return null
  let node: NavNode | null = nav[pi]
  for (let i = 1; i < path.length && node; i++) {
    node = node.children?.[path[i]] ?? null
  }
  return node
}
