import type { SkillCategory } from "@/lib/types";

// Pinned to a devicon release via jsDelivr so icons never break when files
// move on master. Bump deliberately, never track @latest.
const DEVICON = "https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons";

function d(id: string, label: string, icon: string, docUrl: string) {
  return { id, label, iconUrl: `${DEVICON}/${icon}`, docUrl };
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "languages",
    label: "Programming Languages",
    skills: [
      d("javascript", "JavaScript", "javascript/javascript-original.svg", "https://developer.mozilla.org/docs/Web/JavaScript"),
      d("typescript", "TypeScript", "typescript/typescript-original.svg", "https://www.typescriptlang.org/"),
      d("python", "Python", "python/python-original.svg", "https://www.python.org"),
      d("java", "Java", "java/java-original.svg", "https://www.java.com"),
      d("csharp", "C#", "csharp/csharp-original.svg", "https://learn.microsoft.com/dotnet/csharp/"),
      d("cplusplus", "C++", "cplusplus/cplusplus-original.svg", "https://isocpp.org/"),
      d("c", "C", "c/c-original.svg", "https://en.cppreference.com/w/c"),
      d("go", "Go", "go/go-original.svg", "https://go.dev"),
      d("rust", "Rust", "rust/rust-original.svg", "https://www.rust-lang.org"),
      d("php", "PHP", "php/php-original.svg", "https://www.php.net"),
      d("ruby", "Ruby", "ruby/ruby-original.svg", "https://www.ruby-lang.org"),
      d("kotlin", "Kotlin", "kotlin/kotlin-original.svg", "https://kotlinlang.org"),
      d("swift", "Swift", "swift/swift-original.svg", "https://developer.apple.com/swift/"),
      d("dart", "Dart", "dart/dart-original.svg", "https://dart.dev"),
      d("bash", "Bash", "bash/bash-original.svg", "https://www.gnu.org/software/bash/"),
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    skills: [
      d("react", "React", "react/react-original.svg", "https://react.dev"),
      d("nextjs", "Next.js", "nextjs/nextjs-original.svg", "https://nextjs.org"),
      d("vuejs", "Vue.js", "vuejs/vuejs-original.svg", "https://vuejs.org"),
      d("angular", "Angular", "angularjs/angularjs-original.svg", "https://angular.dev"),
      d("svelte", "Svelte", "svelte/svelte-original.svg", "https://svelte.dev"),
      d("tailwindcss", "Tailwind CSS", "tailwindcss/tailwindcss-original.svg", "https://tailwindcss.com"),
      d("bootstrap", "Bootstrap", "bootstrap/bootstrap-original.svg", "https://getbootstrap.com"),
      d("sass", "Sass", "sass/sass-original.svg", "https://sass-lang.com"),
      d("html5", "HTML5", "html5/html5-original.svg", "https://developer.mozilla.org/docs/Web/HTML"),
      d("css3", "CSS3", "css3/css3-original.svg", "https://developer.mozilla.org/docs/Web/CSS"),
      d("redux", "Redux", "redux/redux-original.svg", "https://redux.js.org"),
    ],
  },
  {
    id: "backend",
    label: "Backend",
    skills: [
      d("nodejs", "Node.js", "nodejs/nodejs-original.svg", "https://nodejs.org"),
      d("express", "Express", "express/express-original.svg", "https://expressjs.com"),
      d("nestjs", "NestJS", "nestjs/nestjs-original.svg", "https://nestjs.com"),
      d("django", "Django", "django/django-plain.svg", "https://www.djangoproject.com"),
      d("flask", "Flask", "flask/flask-original.svg", "https://flask.palletsprojects.com"),
      d("fastapi", "FastAPI", "fastapi/fastapi-original.svg", "https://fastapi.tiangolo.com"),
      d("spring", "Spring", "spring/spring-original.svg", "https://spring.io"),
      d("laravel", "Laravel", "laravel/laravel-original.svg", "https://laravel.com"),
      d("graphql", "GraphQL", "graphql/graphql-plain.svg", "https://graphql.org"),
      d("rabbitmq", "RabbitMQ", "rabbitmq/rabbitmq-original.svg", "https://www.rabbitmq.com"),
      d("kafka", "Apache Kafka", "apachekafka/apachekafka-original.svg", "https://kafka.apache.org"),
    ],
  },
  {
    id: "mobile",
    label: "Mobile",
    skills: [
      d("flutter", "Flutter", "flutter/flutter-original.svg", "https://flutter.dev"),
      d("reactnative", "React Native", "react/react-original.svg", "https://reactnative.dev"),
      d("android", "Android", "android/android-original.svg", "https://developer.android.com"),
      d("apple", "iOS", "apple/apple-original.svg", "https://developer.apple.com"),
    ],
  },
  {
    id: "aiml",
    label: "AI / ML",
    skills: [
      d("tensorflow", "TensorFlow", "tensorflow/tensorflow-original.svg", "https://www.tensorflow.org"),
      d("pytorch", "PyTorch", "pytorch/pytorch-original.svg", "https://pytorch.org"),
      d("pandas", "Pandas", "pandas/pandas-original.svg", "https://pandas.pydata.org"),
      d("numpy", "NumPy", "numpy/numpy-original.svg", "https://numpy.org"),
      d("opencv", "OpenCV", "opencv/opencv-original.svg", "https://opencv.org"),
      d("jupyter", "Jupyter", "jupyter/jupyter-original.svg", "https://jupyter.org"),
    ],
  },
  {
    id: "databases",
    label: "Databases",
    skills: [
      d("postgresql", "PostgreSQL", "postgresql/postgresql-original.svg", "https://www.postgresql.org"),
      d("mysql", "MySQL", "mysql/mysql-original.svg", "https://www.mysql.com"),
      d("mariadb", "MariaDB", "mariadb/mariadb-original.svg", "https://mariadb.org"),
      d("mongodb", "MongoDB", "mongodb/mongodb-original.svg", "https://www.mongodb.com"),
      d("redis", "Redis", "redis/redis-original.svg", "https://redis.io"),
      d("sqlite", "SQLite", "sqlite/sqlite-original.svg", "https://www.sqlite.org"),
      d("elasticsearch", "Elasticsearch", "elasticsearch/elasticsearch-original.svg", "https://www.elastic.co"),
      d("firebase", "Firebase", "firebase/firebase-plain.svg", "https://firebase.google.com"),
    ],
  },
  {
    id: "devops",
    label: "DevOps & Cloud",
    skills: [
      d("docker", "Docker", "docker/docker-original.svg", "https://www.docker.com"),
      d("kubernetes", "Kubernetes", "kubernetes/kubernetes-plain.svg", "https://kubernetes.io"),
      d("amazonwebservices", "AWS", "amazonwebservices/amazonwebservices-original-wordmark.svg", "https://aws.amazon.com"),
      d("azure", "Azure", "azure/azure-original.svg", "https://azure.microsoft.com"),
      d("googlecloud", "Google Cloud", "googlecloud/googlecloud-original.svg", "https://cloud.google.com"),
      d("nginx", "Nginx", "nginx/nginx-original.svg", "https://nginx.org"),
      d("jenkins", "Jenkins", "jenkins/jenkins-original.svg", "https://www.jenkins.io"),
      d("githubactions", "GitHub Actions", "githubactions/githubactions-original.svg", "https://github.com/features/actions"),
      d("terraform", "Terraform", "terraform/terraform-original.svg", "https://developer.hashicorp.com/terraform"),
      d("linux", "Linux", "linux/linux-original.svg", "https://www.linux.org"),
    ],
  },
  {
    id: "tools",
    label: "Tools & Testing",
    skills: [
      d("git", "Git", "git/git-original.svg", "https://git-scm.com"),
      d("vscode", "VS Code", "vscode/vscode-original.svg", "https://code.visualstudio.com"),
      d("postman", "Postman", "postman/postman-original.svg", "https://www.postman.com"),
      d("figma", "Figma", "figma/figma-original.svg", "https://www.figma.com"),
      d("jest", "Jest", "jest/jest-plain.svg", "https://jestjs.io"),
      d("selenium", "Selenium", "selenium/selenium-original.svg", "https://www.selenium.dev"),
      d("cypressio", "Cypress", "cypressio/cypressio-original.svg", "https://www.cypress.io"),
    ],
  },
];

export const ALL_SKILLS = SKILL_CATEGORIES.flatMap((c) => c.skills);

export function findSkill(id: string) {
  return ALL_SKILLS.find((s) => s.id === id);
}
