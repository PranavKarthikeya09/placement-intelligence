export interface SkillRoadmapLevel {
  level_number: number;
  topic: string;
  category?: "fundamentals" | "intermediate" | "advanced" | "applied";
}

export const SKILL_ROADMAP_TOPICS: Record<string, SkillRoadmapLevel[]> = {
  "Data Structures & Algorithms": [
    { level_number: 1, topic: "Basic array traversal, strings, and mathematical problem solving", category: "fundamentals" },
    { level_number: 2, topic: "Two-pointer technique, sliding window, and frequency maps", category: "fundamentals" },
    { level_number: 3, topic: "Singly and doubly linked list manipulation, stacks, and queues", category: "fundamentals" },
    { level_number: 4, topic: "Recursion fundamentals, backtracking, and binary search variants", category: "intermediate" },
    { level_number: 5, topic: "Binary trees, binary search trees (BST), and depth/breadth first traversals", category: "intermediate" },
    { level_number: 6, topic: "Heaps, priority queues, and disjoint set union (DSU) operations", category: "intermediate" },
    { level_number: 7, topic: "Graph theory: BFS, DFS, Dijkstra, topological sort, and cycle detection", category: "advanced" },
    { level_number: 8, topic: "Dynamic programming: 1D/2D memoization, knapsack, and longest subsequence", category: "advanced" },
    { level_number: 9, topic: "Trie trees, segment trees, bit manipulation, and string matching algorithms", category: "applied" },
    { level_number: 10, topic: "Competitive algorithmic optimization, amortized complexity, and hard DP on trees", category: "applied" },
  ],
  "Object-Oriented Programming": [
    { level_number: 1, topic: "Classes, objects, attributes, methods, and constructor instantiation", category: "fundamentals" },
    { level_number: 2, topic: "Encapsulation, access modifiers (public/private/protected), and data hiding", category: "fundamentals" },
    { level_number: 3, topic: "Inheritance hierarchies, method overriding, and super keyword usage", category: "fundamentals" },
    { level_number: 4, topic: "Polymorphism: compile-time (overloading) vs runtime (dynamic dispatch)", category: "intermediate" },
    { level_number: 5, topic: "Abstract classes, pure virtual functions, and interface contracts", category: "intermediate" },
    { level_number: 6, topic: "SOLID design principles (SRP, OCP, LSP, ISP, DIP) in practical code", category: "intermediate" },
    { level_number: 7, topic: "Creational patterns: Singleton, Factory Method, Abstract Factory, and Builder", category: "advanced" },
    { level_number: 8, topic: "Structural and behavioral patterns: Adapter, Decorator, Observer, and Strategy", category: "advanced" },
    { level_number: 9, topic: "Memory management, destructors, garbage collection, and object lifecycle", category: "applied" },
    { level_number: 10, topic: "Domain-driven design, anti-patterns resolution, and enterprise OOP architecture", category: "applied" },
  ],
  "SQL & Databases": [
    { level_number: 1, topic: "Relational concepts, primary/foreign keys, and basic SELECT queries", category: "fundamentals" },
    { level_number: 2, topic: "Filtering with WHERE, pattern matching with LIKE, ORDER BY, and DISTINCT", category: "fundamentals" },
    { level_number: 3, topic: "Aggregate functions (COUNT, SUM, AVG, MIN, MAX) and GROUP BY / HAVING", category: "fundamentals" },
    { level_number: 4, topic: "Table joins: INNER, LEFT, RIGHT, FULL OUTER, and CROSS joins", category: "intermediate" },
    { level_number: 5, topic: "Subqueries, nested queries, correlated subqueries, and EXISTS clauses", category: "intermediate" },
    { level_number: 6, topic: "Database normalization (1NF, 2NF, 3NF, BCNF) and schema modeling", category: "intermediate" },
    { level_number: 7, topic: "Window functions (ROW_NUMBER, RANK, DENSE_RANK, LEAD/LAG, PARTITION BY)", category: "advanced" },
    { level_number: 8, topic: "ACID properties, transaction isolation levels, row vs table locking", category: "advanced" },
    { level_number: 9, topic: "B-Tree indexing strategies, EXPLAIN execution plan analysis, and query tuning", category: "applied" },
    { level_number: 10, topic: "Database sharding, read replicas, partitioning, and NoSQL polyglot persistence", category: "applied" },
  ],
  "Cloud Fundamentals (AWS/Azure)": [
    { level_number: 1, topic: "Cloud computing definitions: IaaS, PaaS, SaaS, and public/private deployment", category: "fundamentals" },
    { level_number: 2, topic: "Core compute primitives (AWS EC2 / Azure VMs, auto-scaling groups)", category: "fundamentals" },
    { level_number: 3, topic: "Object and block storage (AWS S3, EBS, Azure Blob Storage, Storage Accounts)", category: "fundamentals" },
    { level_number: 4, topic: "Cloud networking basics: VPC/VNet, subnets, route tables, and internet gateways", category: "intermediate" },
    { level_number: 5, topic: "Identity & Access Management (IAM): policies, roles, least privilege access", category: "intermediate" },
    { level_number: 6, topic: "Managed cloud databases (AWS RDS, DynamoDB, Azure SQL Database)", category: "intermediate" },
    { level_number: 7, topic: "Serverless compute paradigms: AWS Lambda, Azure Functions, and API Gateway", category: "advanced" },
    { level_number: 8, topic: "Infrastructure as Code (IaC): Terraform basics, CloudFormation, ARM templates", category: "advanced" },
    { level_number: 9, topic: "Cloud monitoring, logging, alarms (CloudWatch, Azure Monitor), and FinOps", category: "applied" },
    { level_number: 10, topic: "Multi-region disaster recovery, high availability architecture, and zero-trust", category: "applied" },
  ],
  "Operating Systems": [
    { level_number: 1, topic: "OS architecture overview: kernel space, user space, and system calls", category: "fundamentals" },
    { level_number: 2, topic: "Process concepts, process control block (PCB), process states, and context switch", category: "fundamentals" },
    { level_number: 3, topic: "Threads vs processes, multi-threading models, and race conditions", category: "fundamentals" },
    { level_number: 4, topic: "CPU scheduling algorithms: FCFS, SJF, Round Robin, and Priority Scheduling", category: "intermediate" },
    { level_number: 5, topic: "Process synchronization: mutexes, semaphores, critical section, and monitors", category: "intermediate" },
    { level_number: 6, topic: "Deadlocks: 4 necessary conditions, prevention, avoidance (Banker's algorithm)", category: "intermediate" },
    { level_number: 7, topic: "Memory management: paging, segmentation, page tables, and virtual memory", category: "advanced" },
    { level_number: 8, topic: "Page replacement algorithms: FIFO, LRU, Optimal, and Thrashing prevention", category: "advanced" },
    { level_number: 9, topic: "File system internals: inodes, disk scheduling (SCAN, C-SCAN), and I/O buffers", category: "applied" },
    { level_number: 10, topic: "Linux kernel profiling, IPC (sockets, pipes, shared memory), and virtualization", category: "applied" },
  ],
  "Computer Networks": [
    { level_number: 1, topic: "OSI 7-layer model vs TCP/IP 4-layer model and encapsulation workflows", category: "fundamentals" },
    { level_number: 2, topic: "Physical & Data Link layer: MAC addressing, framing, Ethernet, and ARP", category: "fundamentals" },
    { level_number: 3, topic: "Network layer: IPv4/IPv6 addressing, subnetting, CIDR notation, and ICMP", category: "fundamentals" },
    { level_number: 4, topic: "Transport layer fundamentals: TCP vs UDP headers, ports, and socket connections", category: "intermediate" },
    { level_number: 5, topic: "TCP 3-way handshake, 4-way teardown, flow control, and sliding window", category: "intermediate" },
    { level_number: 6, topic: "TCP congestion control algorithms (Slow Start, Congestion Avoidance, Fast Recovery)", category: "intermediate" },
    { level_number: 7, topic: "Application protocols: HTTP/1.1, HTTP/2, HTTP/3 (QUIC), DNS hierarchy, DHCP", category: "advanced" },
    { level_number: 8, topic: "Network security: TLS/SSL handshake, symmetric/asymmetric encryption, certificates", category: "advanced" },
    { level_number: 9, topic: "Routing protocols (OSPF, BGP, RIP), NAT, proxies, and load balancers", category: "applied" },
    { level_number: 10, topic: "Software-defined networking (SDN), packet sniffing (Wireshark), and CDN edge routing", category: "applied" },
  ],
  "Aptitude & Logical Reasoning": [
    { level_number: 1, topic: "Number systems, divisibility rules, LCM, HCF, and simplification", category: "fundamentals" },
    { level_number: 2, topic: "Percentages, ratios, proportions, averages, and mixture allegations", category: "fundamentals" },
    { level_number: 3, topic: "Profit and loss, simple interest, compound interest, and discount calculations", category: "fundamentals" },
    { level_number: 4, topic: "Time, speed, distance, relative velocity, trains, boats, and streams", category: "intermediate" },
    { level_number: 5, topic: "Time and work, pipes and cisterns, work efficiency, and alternate days", category: "intermediate" },
    { level_number: 6, topic: "Permutations, combinations, probability fundamentals, and conditional probability", category: "intermediate" },
    { level_number: 7, topic: "Logical deductions: syllogisms, Venn diagrams, blood relations, and direction sense", category: "advanced" },
    { level_number: 8, topic: "Seating arrangements (linear/circular), matrix puzzles, and order ranking", category: "advanced" },
    { level_number: 9, topic: "Data interpretation: tables, bar graphs, pie charts, and radar charts", category: "applied" },
    { level_number: 10, topic: "Critical reasoning, statement-assumptions, cause-effect, and speed math shortcuts", category: "applied" },
  ],
  "Communication & Behavioral": [
    { level_number: 1, topic: "Clear verbal self-introduction, elevator pitch, and active listening etiquette", category: "fundamentals" },
    { level_number: 2, topic: "Professional email writing, concise status reporting, and formatting clarity", category: "fundamentals" },
    { level_number: 3, topic: "STAR framework (Situation, Task, Action, Result) for behavioral answers", category: "fundamentals" },
    { level_number: 4, topic: "Explaining technical concepts simply to non-technical stakeholders", category: "intermediate" },
    { level_number: 5, topic: "Constructive feedback delivery, active peer code review etiquette", category: "intermediate" },
    { level_number: 6, topic: "Conflict resolution, managing differing technical opinions with diplomacy", category: "intermediate" },
    { level_number: 7, topic: "Handling high-pressure situational interview questions and ambiguity", category: "advanced" },
    { level_number: 8, topic: "Cross-cultural communication in distributed global agile engineering teams", category: "advanced" },
    { level_number: 9, topic: "Leading sprint retrospectives, technical presentations, and demo facilitation", category: "applied" },
    { level_number: 10, topic: "Executive storytelling, stakeholder alignment, and persuasive technical writing", category: "applied" },
  ],
  "Web Development Basics": [
    { level_number: 1, topic: "Semantic HTML5 tags, document structure, accessibility (a11y), and web standards", category: "fundamentals" },
    { level_number: 2, topic: "CSS3 selectors, box model, specificity, Flexbox, and responsive design", category: "fundamentals" },
    { level_number: 3, topic: "CSS Grid layouts, media queries, CSS variables, and modern styling patterns", category: "fundamentals" },
    { level_number: 4, topic: "JavaScript ES6+: let/const, arrow functions, destructuring, modules, template literals", category: "intermediate" },
    { level_number: 5, topic: "DOM manipulation, event delegation, event bubbling, and browser storage (localStorage)", category: "intermediate" },
    { level_number: 6, topic: "Asynchronous JavaScript: callbacks, Promises, async/await, and Fetch API", category: "intermediate" },
    { level_number: 7, topic: "Component-driven UI architectures: React state, props, hooks (useState, useEffect)", category: "advanced" },
    { level_number: 8, topic: "State management, client routing, custom hooks, and React performance optimization", category: "advanced" },
    { level_number: 9, topic: "RESTful API integration, CORS handling, authentication tokens, and form validation", category: "applied" },
    { level_number: 10, topic: "Web performance (Core Web Vitals), bundle splitting, SSR/SSG concepts, and PWA basics", category: "applied" },
  ],
  "System Design (Intro)": [
    { level_number: 1, topic: "Client-server architecture, monolithic vs microservices high-level concepts", category: "fundamentals" },
    { level_number: 2, topic: "Vertical scaling vs Horizontal scaling, stateless vs stateful servers", category: "fundamentals" },
    { level_number: 3, topic: "Load balancers (L4 vs L7, Round Robin, Least Connections, IP Hash)", category: "fundamentals" },
    { level_number: 4, topic: "Caching strategies: Redis/Memcached, Cache-Aside, Write-Through, eviction policies", category: "intermediate" },
    { level_number: 5, topic: "Database replication: Master-Slave, Master-Master, read-heavy vs write-heavy patterns", category: "intermediate" },
    { level_number: 6, topic: "CAP Theorem (Consistency, Availability, Partition tolerance) & PACELC analysis", category: "intermediate" },
    { level_number: 7, topic: "Message queues & event streaming: RabbitMQ, Apache Kafka, publish-subscribe decoupling", category: "advanced" },
    { level_number: 8, topic: "Content Delivery Networks (CDN) & reverse proxies (Nginx/Envoy) for edge caching", category: "advanced" },
    { level_number: 9, topic: "Designing scalable URL shortener (e.g. TinyURL) and rate limiter algorithms", category: "applied" },
    { level_number: 10, topic: "Designing high-scale social feed (e.g. Twitter) with fanout-on-read vs fanout-on-write", category: "applied" },
  ],
  "Git & Version Control": [
    { level_number: 1, topic: "Version control concepts, git init, git clone, and repository setup", category: "fundamentals" },
    { level_number: 2, topic: "Staging area, git add, git commit, git status, and git log inspection", category: "fundamentals" },
    { level_number: 3, topic: "Branching workflows: git branch, git checkout, git switch, and git merge", category: "fundamentals" },
    { level_number: 4, topic: "Remote repository management: git remote, git fetch, git pull, git push", category: "intermediate" },
    { level_number: 5, topic: "Resolving merge conflicts, 3-way merge inspection, and .gitignore patterns", category: "intermediate" },
    { level_number: 6, topic: "Git stash workflows, temporary context switching, and git clean", category: "intermediate" },
    { level_number: 7, topic: "Git rebase vs merge, interactive rebase (git rebase -i), squashing commits", category: "advanced" },
    { level_number: 8, topic: "Git cherry-pick, git revert, git reset (soft vs mixed vs hard), and HEAD reflog", category: "advanced" },
    { level_number: 9, topic: "Pull request etiquette, trunk-based development vs GitFlow, and signed commits", category: "applied" },
    { level_number: 10, topic: "Git hooks automation, submodules, bisect debugging, and CI/CD triggers", category: "applied" },
  ],
  "Generative AI Basics": [
    { level_number: 1, topic: "Foundations of AI/ML vs Deep Learning vs Generative AI paradigms", category: "fundamentals" },
    { level_number: 2, topic: "Transformer architecture intuition: self-attention, tokens, and context windows", category: "fundamentals" },
    { level_number: 3, topic: "Prompt engineering fundamentals: zero-shot, few-shot, and role prompting", category: "fundamentals" },
    { level_number: 4, topic: "Chain-of-thought prompting, self-consistency, and system instruction tuning", category: "intermediate" },
    { level_number: 5, topic: "Embeddings, vector spaces, cosine similarity, and semantic search concepts", category: "intermediate" },
    { level_number: 6, topic: "Retrieval-Augmented Generation (RAG) pipeline: chunking, indexing, generation", category: "intermediate" },
    { level_number: 7, topic: "Vector databases (Pinecone, Chroma, pgvector) and hybrid search filtering", category: "advanced" },
    { level_number: 8, topic: "LLM API integration (OpenAI, Gemini, Claude SDKs) and structured JSON outputs", category: "advanced" },
    { level_number: 9, topic: "AI agent architectures: ReAct framework, function calling, tool use, memory loops", category: "applied" },
    { level_number: 10, topic: "LLM evaluation, guardrails, hallucinations mitigation, and ethical AI governance", category: "applied" },
  ],
};

export function getRoadmapForSkill(skillName: string): SkillRoadmapLevel[] {
  // Normalize match
  const matched = Object.keys(SKILL_ROADMAP_TOPICS).find(
    (key) => key.toLowerCase() === skillName.toLowerCase() || skillName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(skillName.toLowerCase())
  );

  if (matched && SKILL_ROADMAP_TOPICS[matched]) {
    return SKILL_ROADMAP_TOPICS[matched];
  }

  // Fallback 10 generic progressive levels if unmatched
  return Array.from({ length: 10 }, (_, i) => ({
    level_number: i + 1,
    topic: `Proficiency Level ${i + 1}: Practical applied concepts and real-world implementation`,
    category: i < 3 ? "fundamentals" : i < 6 ? "intermediate" : i < 8 ? "advanced" : "applied",
  }));
}
