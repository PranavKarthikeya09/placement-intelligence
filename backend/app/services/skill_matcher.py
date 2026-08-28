"""
RADIX Skill Matching Engine
Module 5: Deterministic, Category-Aware, Multi-Stage Skill Matching Service.
"""

from datetime import datetime, timezone
import re
from difflib import SequenceMatcher
from typing import Dict, List, Optional, Set, Tuple

from app.models.candidate import CandidateProfile
from app.models.jd import JDAnalysisResult
from app.models.skill import Skill, SkillCategoryCode, SkillConfidence
from app.models.skill_match import (
    MatchConfidence,
    MatchedSkillDetail,
    MissingSkillDetail,
    SkillCriticality,
    SkillMatchResponse,
)

# Canonical Alias Mapping (Normalized lower string -> Canonical display name)
CANONICAL_ALIASES: Dict[str, str] = {
    # SQL & Databases
    "postgres": "postgresql",
    "postgresql db": "postgresql",
    "pgsql": "postgresql",
    "postgres sql": "postgresql",
    "mongodb": "mongodb",
    "mongo": "mongodb",
    "mongo db": "mongodb",
    "ms sql": "microsoft sql server",
    "mssql": "microsoft sql server",
    "mysql": "mysql",
    "mariadb": "mariadb",
    "sqlite": "sqlite",
    "redis": "redis",
    "cassandra": "cassandra",
    "dynamodb": "dynamodb",
    # Coding & Languages
    "python": "python",
    "py": "python",
    "javascript": "javascript",
    "js": "javascript",
    "typescript": "typescript",
    "ts": "typescript",
    "golang": "go",
    "go lang": "go",
    "cpp": "c++",
    "c plus plus": "c++",
    "c sharp": "c#",
    "csharp": "c#",
    "cs": "c#",
    "ruby": "ruby",
    "rust": "rust",
    "php": "php",
    "kotlin": "kotlin",
    "swift": "swift",
    "dart": "dart",
    "scala": "scala",
    "r lang": "r",
    # Frameworks & Libraries
    "react": "react",
    "reactjs": "react",
    "react.js": "react",
    "react js": "react",
    "react native": "react native",
    "nodejs": "node.js",
    "node.js": "node.js",
    "node js": "node.js",
    "node": "node.js",
    "express": "express.js",
    "expressjs": "express.js",
    "express.js": "express.js",
    "vue": "vue.js",
    "vuejs": "vue.js",
    "vue.js": "vue.js",
    "angular": "angular",
    "angularjs": "angular",
    "angular.js": "angular",
    "nextjs": "next.js",
    "next.js": "next.js",
    "nestjs": "nest.js",
    "nest.js": "nest.js",
    "django": "django",
    "flask": "flask",
    "fastapi": "fastapi",
    "spring": "spring boot",
    "springboot": "spring boot",
    "spring boot": "spring boot",
    "laravel": "laravel",
    "rails": "ruby on rails",
    "ruby on rails": "ruby on rails",
    ".net": ".net",
    "dotnet": ".net",
    "asp.net": "asp.net",
    # Cloud & DevOps
    "aws": "amazon web services",
    "amazon web services": "amazon web services",
    "gcp": "google cloud platform",
    "google cloud platform": "google cloud platform",
    "google cloud": "google cloud platform",
    "azure": "microsoft azure",
    "ms azure": "microsoft azure",
    "microsoft azure": "microsoft azure",
    "docker": "docker",
    "docker compose": "docker compose",
    "k8s": "kubernetes",
    "kubernetes": "kubernetes",
    "terraform": "terraform",
    "ansible": "ansible",
    "ci/cd": "ci/cd",
    "cicd": "ci/cd",
    "ci cd": "ci/cd",
    "continuous integration": "ci/cd",
    "jenkins": "jenkins",
    "github actions": "github actions",
    "gitlab ci": "gitlab ci",
    # AI / ML
    "ml": "machine learning",
    "machine learning": "machine learning",
    "dl": "deep learning",
    "deep learning": "deep learning",
    "nlp": "natural language processing",
    "natural language processing": "natural language processing",
    "cv": "computer vision",
    "computer vision": "computer vision",
    "genai": "generative ai",
    "gen ai": "generative ai",
    "generative ai": "generative ai",
    "llm": "large language models",
    "llms": "large language models",
    "large language models": "large language models",
    "tensorflow": "tensorflow",
    "tf": "tensorflow",
    "pytorch": "pytorch",
    "torch": "pytorch",
    "scikit-learn": "scikit-learn",
    "sklearn": "scikit-learn",
    "pandas": "pandas",
    "numpy": "numpy",
    "keras": "keras",
    # SWE / DSA / OOD / SYSD / NETW / OS
    "git": "git",
    "github": "github",
    "gitlab": "gitlab",
    "dsa": "data structures and algorithms",
    "data structures": "data structures and algorithms",
    "data structures and algorithms": "data structures and algorithms",
    "data structures & algorithms": "data structures and algorithms",
    "algorithms": "data structures and algorithms",
    "oop": "object-oriented design",
    "ood": "object-oriented design",
    "object-oriented programming": "object-oriented design",
    "object oriented programming": "object-oriented design",
    "object-oriented design": "object-oriented design",
    "object oriented design": "object-oriented design",
    "system design": "system design",
    "sys design": "system design",
    "distributed systems": "system design",
    "microservices": "microservices",
    "rest api": "rest apis",
    "restful api": "rest apis",
    "rest apis": "rest apis",
    "restful apis": "rest apis",
    "rest": "rest apis",
    "graphql": "graphql",
    "grpc": "grpc",
    "websockets": "websockets",
    "websocket": "websockets",
    "tcp/ip": "tcp/ip",
    "http": "http/https",
    "https": "http/https",
    "linux": "linux",
    "unix": "linux",
    "linux/unix": "linux",
    "operating systems": "operating systems",
    "operating system": "operating systems",
    "os concepts": "operating systems",
}

# Distinct skills that must NEVER match under fuzzy matching
ANTI_COLLISION_PAIRS: Set[Tuple[str, str]] = {
    ("java", "javascript"),
    ("javascript", "java"),
    ("c", "c++"),
    ("c++", "c"),
    ("c", "c#"),
    ("c#", "c"),
    ("c++", "c#"),
    ("c#", "c++"),
    ("sql", "nosql"),
    ("nosql", "sql"),
    ("typescript", "javascript"),
    ("javascript", "typescript"),
    ("react", "react native"),
    ("react native", "react"),
    ("python", "cython"),
    ("cython", "python"),
    ("r", "rust"),
    ("rust", "r"),
    ("r", "ruby"),
    ("ruby", "r"),
    ("go", "django"),
    ("django", "go"),
}

# Short strings that must bypass fuzzy matching completely
SHORT_SKILL_EXCLUSIONS: Set[str] = {
    "c", "r", "go", "js", "ts", "py", "cs", "sql", "git", "aws", "gcp", "k8s", "tf", "ml", "dl", "nlp", "cv", "oop", "ood", "dsa", "os"
}

# Related / compatible categories
COMPATIBLE_CATEGORIES: Dict[SkillCategoryCode, Set[SkillCategoryCode]] = {
    SkillCategoryCode.COD: {SkillCategoryCode.COD, SkillCategoryCode.SWE, SkillCategoryCode.DSA, SkillCategoryCode.OOD, SkillCategoryCode.OTHER},
    SkillCategoryCode.DSA: {SkillCategoryCode.DSA, SkillCategoryCode.COD, SkillCategoryCode.SWE, SkillCategoryCode.OTHER},
    SkillCategoryCode.OOD: {SkillCategoryCode.OOD, SkillCategoryCode.COD, SkillCategoryCode.SWE, SkillCategoryCode.OTHER},
    SkillCategoryCode.APTI: {SkillCategoryCode.APTI, SkillCategoryCode.DSA, SkillCategoryCode.OTHER},
    SkillCategoryCode.COMM: {SkillCategoryCode.COMM, SkillCategoryCode.SWE, SkillCategoryCode.OTHER},
    SkillCategoryCode.AI: {SkillCategoryCode.AI, SkillCategoryCode.COD, SkillCategoryCode.SWE, SkillCategoryCode.OTHER},
    SkillCategoryCode.CLOUD: {SkillCategoryCode.CLOUD, SkillCategoryCode.SYSD, SkillCategoryCode.NETW, SkillCategoryCode.OS, SkillCategoryCode.SWE, SkillCategoryCode.OTHER},
    SkillCategoryCode.SQL: {SkillCategoryCode.SQL, SkillCategoryCode.COD, SkillCategoryCode.SWE, SkillCategoryCode.SYSD, SkillCategoryCode.OTHER},
    SkillCategoryCode.SWE: {SkillCategoryCode.SWE, SkillCategoryCode.COD, SkillCategoryCode.DSA, SkillCategoryCode.CLOUD, SkillCategoryCode.OTHER},
    SkillCategoryCode.SYSD: {SkillCategoryCode.SYSD, SkillCategoryCode.CLOUD, SkillCategoryCode.NETW, SkillCategoryCode.OS, SkillCategoryCode.SWE, SkillCategoryCode.OTHER},
    SkillCategoryCode.NETW: {SkillCategoryCode.NETW, SkillCategoryCode.SYSD, SkillCategoryCode.CLOUD, SkillCategoryCode.OS, SkillCategoryCode.SWE, SkillCategoryCode.OTHER},
    SkillCategoryCode.OS: {SkillCategoryCode.OS, SkillCategoryCode.SYSD, SkillCategoryCode.CLOUD, SkillCategoryCode.NETW, SkillCategoryCode.SWE, SkillCategoryCode.OTHER},
    SkillCategoryCode.OTHER: set(SkillCategoryCode),
}

# Curated Learning Topic Recommendations by Category & Skill
CATEGORY_LEARNING_TOPICS: Dict[SkillCategoryCode, str] = {
    SkillCategoryCode.COD: "Syntax fundamentals, idiomatic patterns, asynchronous programming, and clean modular code.",
    SkillCategoryCode.DSA: "Core data structures (arrays, trees, graphs, heaps), sorting & searching algorithms, and dynamic programming.",
    SkillCategoryCode.OOD: "Object-Oriented Design principles (SOLID), design patterns (Factory, Strategy, Observer), and UML modeling.",
    SkillCategoryCode.APTI: "Quantitative reasoning, logical problem-solving, and time-constrained analytical puzzles.",
    SkillCategoryCode.COMM: "Technical writing, API documentation, cross-functional collaboration, and architectural presentations.",
    SkillCategoryCode.AI: "Machine learning workflows, model evaluation metrics, deep learning architectures, and GenAI prompt engineering.",
    SkillCategoryCode.CLOUD: "Cloud infrastructure provisioning, serverless computing, Docker containerization, and Kubernetes orchestration.",
    SkillCategoryCode.SQL: "Relational database schema modeling, indexing strategies (B-Tree/GIN), and query optimization with EXPLAIN ANALYZE.",
    SkillCategoryCode.SWE: "Software development lifecycle, test-driven development, CI/CD pipeline automation, and version control best practices.",
    SkillCategoryCode.SYSD: "Distributed system architectures, caching patterns (Redis), microservices, load balancing, and scalability design.",
    SkillCategoryCode.NETW: "Network protocols (TCP/IP, HTTP/HTTPS, WebSockets), DNS resolution, RESTful API architecture, and network security.",
    SkillCategoryCode.OS: "Operating systems internals: processes, threads, concurrency synchronization, memory allocation, and Linux shell tooling.",
    SkillCategoryCode.OTHER: "Foundational concepts, industry best practices, and hands-on project implementation.",
}

SPECIFIC_LEARNING_TOPICS: Dict[str, str] = {
    "python": "Master advanced Python: decorators, generators, asyncio, type hinting, and FastAPI microservice architecture.",
    "postgresql": "PostgreSQL database administration, indexing optimization, CTEs, window functions, and transaction isolation levels.",
    "docker": "Containerization with Docker, multi-stage Dockerfiles, Docker Compose service orchestration, and volume networking.",
    "kubernetes": "Kubernetes Pod lifecycle, Deployments, Services, Ingress controllers, Helm charts, and cluster scaling.",
    "react": "Modern React: Hooks, custom state management with Zustand/Redux, Server Components, and performance optimization.",
    "typescript": "Advanced TypeScript: generics, conditional types, mapped types, utility types, and strict type safety.",
    "aws": "AWS Core Services (EC2, S3, RDS, Lambda, VPC, IAM) and cloud architecture design for high availability.",
    "system design": "Scalable system design: CAP theorem, distributed caching, database sharding, message queues (Kafka/RabbitMQ), and rate limiting.",
    "data structures and algorithms": "Practice LeetCode medium/hard patterns: sliding window, graph traversals (BFS/DFS), union-find, and DP.",
    "ci/cd": "Build robust CI/CD pipelines with GitHub Actions or GitLab CI, automated testing, container builds, and zero-downtime deployment.",
}


def normalize_skill_text(raw_text: str) -> str:
    """
    Normalize raw skill string into a standardized, canonical form.
    - Lowers case and strips whitespace
    - Removes version tags (e.g., '3.x', 'v14', '3.11')
    - Removes common noise words (programming, development, framework, etc.)
    - Maps known aliases to canonical representations
    """
    if not raw_text:
        return ""

    text = raw_text.strip().lower()

    # Normalize special tokens before regex
    text = text.replace("c++", "cpp").replace("c#", "csharp").replace(".net", "dotnet")
    
    # Remove version identifiers like v16, 3.x, 3.11, 2024
    text = re.sub(r"\b(v\d+(\.\d+)*|\d+(\.\d+)+|\d+x|\d{4})\b", "", text)
    
    # Replace non-alphanumeric punctuation with spaces (preserving standard words)
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
    
    # Revert placeholders
    text = text.replace("cpp", "c++").replace("csharp", "c#").replace("dotnet", ".net")
    
    # Remove noise words
    noise_words = {
        "programming", "development", "developer", "language", "scripting",
        "technology", "technologies", "framework", "frameworks", "tools",
        "tool", "engine", "skills", "skill", "concepts", "concept",
        "architecture", "architectures", "platform", "platforms", "basics", "fundamentals"
    }
    
    tokens = text.split()
    filtered_tokens = [t for t in tokens if t not in noise_words]
    
    # If filtering removed all words, fallback to tokens
    cleaned = " ".join(filtered_tokens) if filtered_tokens else " ".join(tokens)
    cleaned = cleaned.strip()

    # Check canonical alias dictionary
    if cleaned in CANONICAL_ALIASES:
        return CANONICAL_ALIASES[cleaned]
    
    # Also check if raw cleaned text without space normalization matches
    raw_lower = raw_text.strip().lower()
    if raw_lower in CANONICAL_ALIASES:
        return CANONICAL_ALIASES[raw_lower]

    return cleaned


def are_categories_compatible(cat1: SkillCategoryCode, cat2: SkillCategoryCode) -> bool:
    """Check if two RADIX category codes are identical or compatible."""
    if cat1 == cat2:
        return True
    allowed_neighbors = COMPATIBLE_CATEGORIES.get(cat1, set())
    return cat2 in allowed_neighbors


def is_anti_collision(skill_a: str, skill_b: str) -> bool:
    """Return True if two skills are explicitly prevented from matching."""
    return (skill_a, skill_b) in ANTI_COLLISION_PAIRS or (skill_b, skill_a) in ANTI_COLLISION_PAIRS


def compute_string_similarity(str1: str, str2: str) -> float:
    """
    Compute hybrid similarity between two normalized strings:
    Combination of SequenceMatcher ratio and Token Set Overlap.
    """
    if str1 == str2:
        return 1.0
    
    # If either is in short exclusions and not equal, no similarity
    if str1 in SHORT_SKILL_EXCLUSIONS or str2 in SHORT_SKILL_EXCLUSIONS:
        return 0.0
    if len(str1) <= 3 or len(str2) <= 3:
        return 0.0
    
    # Check anti-collision
    if is_anti_collision(str1, str2):
        return 0.0

    # Sequence matcher ratio
    seq_ratio = SequenceMatcher(None, str1, str2).ratio()

    # Token set ratio
    tokens1 = set(str1.split())
    tokens2 = set(str2.split())
    if tokens1 and tokens2:
        intersection = tokens1.intersection(tokens2)
        union = tokens1.union(tokens2)
        jaccard = len(intersection) / len(union)
        
        # If one token set is a complete subset of another (e.g. 'rest api' vs 'rest apis')
        if intersection == tokens1 or intersection == tokens2:
            subset_bonus = 0.9
            return max(seq_ratio, subset_bonus)
        
        # Weighted combination
        return max(seq_ratio, 0.5 * seq_ratio + 0.5 * jaccard)

    return seq_ratio


def deduplicate_skills(skills: List[Skill]) -> List[Skill]:
    """
    Deduplicate skills list by normalized name.
    Preserves highest confidence and highest proficiency level.
    """
    confidence_weight = {SkillConfidence.HIGH: 3, SkillConfidence.MEDIUM: 2, SkillConfidence.LOW: 1}
    dedup_map: Dict[str, Skill] = {}

    for s in skills:
        norm_key = normalize_skill_text(s.skill_name)
        if not norm_key:
            norm_key = s.skill_name.strip().lower()

        if norm_key not in dedup_map:
            dedup_map[norm_key] = s
        else:
            existing = dedup_map[norm_key]
            # Compare and keep higher confidence or level
            existing_cw = confidence_weight.get(existing.confidence, 1)
            new_cw = confidence_weight.get(s.confidence, 1)
            
            best_conf = s.confidence if new_cw > existing_cw else existing.confidence
            best_level = max(existing.level or 0, s.level or 0) or None
            
            # Prefer category from existing if matching, or keep more specific
            best_cat = existing.category_code if existing.category_code != SkillCategoryCode.OTHER else s.category_code
            
            dedup_map[norm_key] = Skill(
                skill_name=existing.skill_name,
                category_code=best_cat,
                evidence=existing.evidence or s.evidence,
                confidence=best_conf,
                level=best_level,
            )

    return list(dedup_map.values())


class SkillMatcherService:
    """
    Service implementing deterministic, multi-stage, category-aware skill matching.
    """

    @classmethod
    def match(
        cls,
        candidate: CandidateProfile,
        jd: JDAnalysisResult,
        minimum_match_threshold: Optional[float] = None,
    ) -> SkillMatchResponse:
        """
        Execute skill matching between candidate profile and JD.
        """
        raw_candidate_skills = candidate.skills or []
        raw_jd_skills = jd.extracted_skills or []

        # Deduplicate skills on both sides
        cand_skills = deduplicate_skills(raw_candidate_skills)
        jd_skills = deduplicate_skills(raw_jd_skills)

        matched_skills: List[MatchedSkillDetail] = []
        missing_skills: List[MissingSkillDetail] = []

        matched_jd_indices: Set[int] = set()
        matched_cand_indices: Set[int] = set()

        # Normalized representations
        norm_jd_skills = [(idx, s, normalize_skill_text(s.skill_name)) for idx, s in enumerate(jd_skills)]
        norm_cand_skills = [(idx, s, normalize_skill_text(s.skill_name)) for idx, s in enumerate(cand_skills)]

        # STAGE 1: Exact & Normalized Match (Category-Aware)
        for j_idx, jd_s, j_norm in norm_jd_skills:
            if j_idx in matched_jd_indices:
                continue

            for c_idx, cand_s, c_norm in norm_cand_skills:
                if c_idx in matched_cand_indices:
                    continue

                if j_norm and c_norm and j_norm == c_norm:
                    # Exact string match on canonical normalized name
                    if jd_s.category_code == cand_s.category_code:
                        confidence = MatchConfidence.EXACT
                        score_contrib = 1.0
                    elif are_categories_compatible(jd_s.category_code, cand_s.category_code):
                        confidence = MatchConfidence.EXACT
                        score_contrib = 0.95
                    else:
                        # Category mismatch penalty
                        confidence = MatchConfidence.SEMANTIC_MEDIUM
                        score_contrib = 0.70

                    matched_skills.append(
                        MatchedSkillDetail(
                            jd_skill=jd_s,
                            candidate_skill=cand_s,
                            match_confidence=confidence,
                            score_contribution=score_contrib,
                        )
                    )
                    matched_jd_indices.add(j_idx)
                    matched_cand_indices.add(c_idx)
                    break

        # STAGE 2: Guarded Fuzzy & Semantic Match (Category-Aware)
        for j_idx, jd_s, j_norm in norm_jd_skills:
            if j_idx in matched_jd_indices:
                continue

            best_match: Optional[Tuple[int, Skill, float, MatchConfidence, float]] = None

            for c_idx, cand_s, c_norm in norm_cand_skills:
                if c_idx in matched_cand_indices:
                    continue

                if is_anti_collision(j_norm, c_norm):
                    continue

                sim = compute_string_similarity(j_norm, c_norm)
                
                # Check category compatibility
                cat_compatible = are_categories_compatible(jd_s.category_code, cand_s.category_code)
                same_cat = (jd_s.category_code == cand_s.category_code)

                # High similarity fuzzy match (>= 0.90)
                if sim >= 0.90 and cat_compatible:
                    conf = MatchConfidence.SEMANTIC_HIGH if same_cat else MatchConfidence.SEMANTIC_MEDIUM
                    contrib = 0.85 if same_cat else 0.75
                    if not best_match or sim > best_match[2]:
                        best_match = (c_idx, cand_s, sim, conf, contrib)
                # Moderate similarity fuzzy match (>= 0.82) strictly with same category
                elif sim >= 0.82 and same_cat:
                    conf = MatchConfidence.SEMANTIC_MEDIUM
                    contrib = 0.70
                    if not best_match or sim > best_match[2]:
                        best_match = (c_idx, cand_s, sim, conf, contrib)

            if best_match:
                c_idx, cand_s, _, conf, contrib = best_match
                matched_skills.append(
                    MatchedSkillDetail(
                        jd_skill=jd_s,
                        candidate_skill=cand_s,
                        match_confidence=conf,
                        score_contribution=contrib,
                    )
                )
                matched_jd_indices.add(j_idx)
                matched_cand_indices.add(c_idx)

        # STAGE 3: Identify Missing Skills & Formulate Learning Topics
        for j_idx, jd_s, j_norm in norm_jd_skills:
            if j_idx not in matched_jd_indices:
                # Assess criticality
                if jd_s.confidence == SkillConfidence.HIGH or (jd_s.level and jd_s.level >= 7):
                    crit = SkillCriticality.HIGH
                elif jd_s.confidence == SkillConfidence.MEDIUM or (jd_s.level and jd_s.level >= 4):
                    crit = SkillCriticality.MEDIUM
                else:
                    crit = SkillCriticality.LOW

                # Determine suggested learning topic
                learning_topic = SPECIFIC_LEARNING_TOPICS.get(j_norm)
                if not learning_topic:
                    learning_topic = CATEGORY_LEARNING_TOPICS.get(
                        jd_s.category_code,
                        f"Study core concepts, hands-on tutorials, and real-world implementations in {jd_s.skill_name}."
                    )

                missing_skills.append(
                    MissingSkillDetail(
                        jd_skill=jd_s,
                        category_code=jd_s.category_code,
                        criticality=crit,
                        suggested_learning_topic=learning_topic,
                    )
                )

        # STAGE 4: Calculate Overall Match Score
        total_jd_count = len(jd_skills)
        if total_jd_count == 0:
            # If JD requires 0 skills, requirements are 100% satisfied
            overall_score = 100.0
        elif len(cand_skills) == 0:
            # If candidate has 0 skills and JD requires > 0 skills, score is 0.0
            overall_score = 0.0
        else:
            # Weighted calculation
            total_possible_score = sum(cls._get_jd_skill_weight(s) for s in jd_skills)
            actual_score = sum(
                cls._get_jd_skill_weight(m.jd_skill) * m.score_contribution
                for m in matched_skills
            )
            raw_percentage = (actual_score / total_possible_score) * 100.0 if total_possible_score > 0 else 0.0
            overall_score = round(min(100.0, max(0.0, raw_percentage)), 1)

        # STAGE 5: Generate Actionable Recommendations
        recommendations = cls._generate_recommendations(
            overall_score=overall_score,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            minimum_match_threshold=minimum_match_threshold,
        )

        job_title = jd.role.job_title if jd.role and jd.role.job_title else "Target Role"
        company_name = jd.company.company_name if jd.company and jd.company.company_name else "Target Company"

        return SkillMatchResponse(
            candidate_id=candidate.id,
            jd_id=jd.id or "jd_unknown",
            job_title=job_title,
            company_name=company_name,
            overall_match_score=overall_score,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            matched_count=len(matched_skills),
            missing_count=len(missing_skills),
            recommendations=recommendations,
            matched_at=datetime.now(timezone.utc).isoformat(),
        )

    @classmethod
    def _get_jd_skill_weight(cls, skill: Skill) -> float:
        """Calculate relative importance weight for a JD skill."""
        if skill.confidence == SkillConfidence.HIGH:
            return 1.0
        elif skill.confidence == SkillConfidence.MEDIUM:
            return 0.85
        return 0.70

    @classmethod
    def _generate_recommendations(
        cls,
        overall_score: float,
        matched_skills: List[MatchedSkillDetail],
        missing_skills: List[MissingSkillDetail],
        minimum_match_threshold: Optional[float] = None,
    ) -> List[str]:
        """Generate human-readable, actionable recommendations based on match evaluation."""
        recs: List[str] = []

        if minimum_match_threshold is not None and overall_score < minimum_match_threshold:
            recs.append(
                f"Candidate score ({overall_score}%) is below the requested threshold of {minimum_match_threshold}%."
            )

        if overall_score >= 80.0:
            recs.append("Strong candidate profile match. Verified alignment with core role competencies.")
        elif overall_score >= 50.0:
            recs.append("Moderate match. Candidate meets several core competencies but has noticeable skill gaps.")
        else:
            recs.append("Low overall alignment. Significant skill enhancement required to meet the job requirements.")

        # Highlight top strengths
        exact_matches = [m.jd_skill.skill_name for m in matched_skills if m.match_confidence == MatchConfidence.EXACT]
        if exact_matches:
            top_strengths = ", ".join(exact_matches[:3])
            recs.append(f"Key Verified Strengths: {top_strengths}.")

        # Highlight high-priority gaps
        high_crit_gaps = [m.jd_skill.skill_name for m in missing_skills if m.criticality == SkillCriticality.HIGH]
        if high_crit_gaps:
            top_gaps = ", ".join(high_crit_gaps[:3])
            recs.append(f"High-Priority Focus Areas: Upskill in {top_gaps} to increase interview readiness.")

        # Specific suggested learning topic for the top missing skill
        if missing_skills:
            top_missing = missing_skills[0]
            if top_missing.suggested_learning_topic:
                recs.append(f"Actionable Next Step for {top_missing.jd_skill.skill_name}: {top_missing.suggested_learning_topic}")

        return recs
