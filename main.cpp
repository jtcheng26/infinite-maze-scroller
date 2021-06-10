#include <iostream>
#include <vector>
#include <ctime>
#include <unordered_set>
#include <queue>
#include <chrono>
#include <thread>

#include <emscripten.h>

using namespace std;

/* Standard DSU implementation with modified make_set method. */
struct DSU {
  vector<int> sz; // size of set
  vector<int> parent; // parent of element
  vector<int> bot; // number of bottom walls in set

  /* Build the DSU with [size] nodes. O(n). */
  void build(int size) {
    sz.resize(size);
    parent.resize(size);
    bot.resize(size);
  }

  /* Find the set that element [v] belongs to. O(1). */
  int find_set(int v) {
    if (v == parent[v])
      return v;
    return parent[v] = find_set(parent[v]);
  }

  /* Take element [v] out of its set and make a new set with it, leaving its old set intact. O(n). */
  void make_set(int v) {
    find_set(v);
    int j = parent[v] == v ? -1 : parent[v];
    for (int i=0;i<sz.size();i++) {
      if (i == v) continue;
      if (find_set(i) == v) {
        if (j == -1) j = i;
        parent[i] = j;
      }
    }
    if (j != -1) {
      bot[j] = bot[parent[v]] - 1;
      sz[j] = sz[parent[v]] - 1;
    }
    parent[v] = v;
    sz[v] = 1;
    bot[v] = 1;
  }

  /* Union the sets of elements [a] and [b]. O(1). */
  void union_sets(int a, int b) {
    a = find_set(a);
    b = find_set(b);
    if (a != b) {
      if (sz[a] < sz[b])
        swap(a, b);
      parent[b] = a;
      sz[a] += sz[b];
      bot[a] += bot[b];
    }
  }
};

vector<int> r;
vector<int> b;

int n, m; // columns, rows in maze
DSU dsu;
int rendering = 0; // 0 = next row is right walls, 1 = next row is bottom walls

/* Eller's Algorithm implementation - Generates a new row in the maze. */
void EllersAlgorithm() {
  // Reset the row
  for (int i=0;i<n;i++) {
    r[i] = 1;
    if (b[i]) {
      dsu.make_set(i);
    } else {
      dsu.bot[dsu.find_set(i)]++;
    }
    b[i] = 1;
  }
  // Randomly merge cells horizontally
  for (int i=0;i<n-1;i++) {
    if (dsu.find_set(i) != dsu.find_set(i+1)) {
      r[i] = rand() % 2;
      if (!r[i]) {
        dsu.union_sets(i, i+1);
      }
    }
  }
  // Randomly merge cells vertically
  for (int i=0;i<n;i++) {
    b[i] = rand() % 2;
    if (!b[i])
      dsu.bot[dsu.find_set(i)]--;
  }
  // Fix vertical cells so no sets get cut off
  vector<int> cnt(n, 0);
  vector<int> cut(n, -1);
  for (int i=0;i<n;i++) {
    if (dsu.bot[dsu.find_set(i)] == dsu.sz[dsu.find_set(i)])
      cut[dsu.find_set(i)] = rand() % dsu.sz[dsu.find_set(i)];
  }
  for (int i=0;i<n;i++) {
    if (cnt[dsu.find_set(i)] == cut[dsu.find_set(i)]) {
      b[i] = 0;
      dsu.bot[dsu.find_set(i)]--;
    }
    cnt[dsu.find_set(i)]++;
  }
}

/* Fixes the last row of the maze. */
void endMaze() {
  for (int i=0;i<n-1;i++) {
    if (dsu.find_set(i) != dsu.find_set(i+1)) {
      r[i] = 0;
      dsu.union_sets(i, i+1);
    }
    b[i] = 1;
  }
  b[n-1] = 1;
}

/* Print a line of walls. */
void printEdge() {
  cout << "+";
  for (int i=0;i<n;i++) {
    cout << (b[i] ? "—————" : "     ") << "+";
  }
  cout << "\n";
}

/* Print the row produced by Eller's Algorithm. */
void printRow() {
  for (int j=0;j<2;j++) {
    cout << "|";
    for (int i=0;i<n;i++) {
      cout << "     " << ((r[i] || i == n-1) ? "|" : " ");
    }
    cout << "\n";
  }
  printEdge();
}

/* Javascript bindings for DOM manipulation */

EM_JS(void, Row, (), {
  const node = document.createElement("div");
  node.className = "row";
  return node;
})

EM_JS(void, Node, (), {
  const node = document.createElement("div");
  node.className = "node";
  return node;
})

EM_JS(void, Wall, (), {
  const node = document.createElement("div");
  node.className = "wall node";
  return node;
})

EM_JS(void, Path, (), {
  const node = document.createElement("div");
  node.className = "path node";
  return node;
})

EM_JS(int, appendRow, (), {
  document.getElementById("wrapper").appendChild(Row());
  return document.getElementById("wrapper").childElementCount - 1;
})

/* Add a wall and additional styles necessary for proper borders */
EM_JS(void, appendWall, (int row), {
  const wrapper = document.getElementById("wrapper");
  const r = wrapper.children[row];
  const w = Wall();
  const col = r.childElementCount;
  if (col > 0 && r.children[col-1].className.includes("wall")) {
    r.children[col-1].className += " adj-E";
    if (r.children[col-1].className.includes("adj-N")) {
      const ne = document.createElement("div");
      ne.className = "adj-NE";
      r.children[col-1].appendChild(ne);
    }
    w.className += " adj-W";
  }
  if (row > 0 && wrapper.children[row-1].children[col].className.includes("wall")) {
    wrapper.children[row-1].children[col].className += " adj-S";
    if (wrapper.children[row-1].children[col].className.includes("adj-W")) {
      const sw = document.createElement("div");
      sw.className = "adj-SW";
      wrapper.children[row-1].children[col].appendChild(sw);
    }
    if (wrapper.children[row-1].children[col].className.includes("adj-E")) {
      const se = document.createElement("div");
      se.className = "adj-SE";
      wrapper.children[row-1].children[col].appendChild(se);
    }
    w.className += " adj-N";
    if (w.className.includes("adj-W")) {
      const nw = document.createElement("div");
      nw.className = "adj-NW";
      w.appendChild(nw);
    }
  }
  r.appendChild(w);
})

EM_JS(void, renderWalls, (int columns), {
  const wrapper = document.getElementById("wrapper");
  const row = Row();
  wrapper.appendChild(row);
  for (var i=0;i<=2*columns;i++) {
    appendWall(0)
  }
})

EM_JS(void, appendPath, (int row), {
  const r = document.getElementById("wrapper").children[row];
  r.appendChild(Path());
})

/* Render a new row */
void renderRow() {
  if (rendering == 0) {
    int row = appendRow();
    appendWall(row);
    for (int i=0;i<2*n;i++) {
      if (i % 2 == 0)
        appendPath(row);
      else if (r[i/2] || i == 2*n-1) {
        appendWall(row);
      }
      else
        appendPath(row);
    }
  } else {
    int row = appendRow();
    appendWall(row);
    for (int i=0;i<2*n;i++) {
      if (i % 2 == 1)
        appendWall(row);
      else if (b[i / 2])
        appendWall(row);
      else
        appendPath(row);
    }
  }
  rendering = !rendering;
}

/* Rerun algorithm if necessary (algorithm produces 2 sets of walls) */
void EMSCRIPTEN_KEEPALIVE newRow() {
  if (rendering == 0)
    EllersAlgorithm();
  //printRow();
  renderRow();
}

/* Initialize the maze */
void EMSCRIPTEN_KEEPALIVE init(int columns) {
  n = columns;
  srand ( time(NULL) );
  r.resize(n, 0);
  b.resize(n, 1);
  dsu.build(n);
  renderWalls(n);
  //printEdge();
}

int main() {
  /*
  cin >> n;
  n = 10;
  m = 20;
  init(n)
  for (int i=0;i<m;i++) {
    newRow();
  }
  */
}