const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Cleaning old CV sections...");
    await prisma.cVSection.deleteMany({});

    const sections = [
        {
            title: "Resumo Profissional",
            content: "Meu propósito é através da arte, ter e levar reflexões profundas, buscando fazer do meu trabalho uma ferramenta de transformação através dos sentimentos, que são pais dos pensamentos que por sua vez regem nossas ações.",
            category: "summary",
            sidebar: false,
            ordem: 1
        },
        {
            title: "Principais Competências",
            content: "• Fotógrafo\n• Diretor de fotografia\n• Coordenador de projetos\n• Produtor Cultural\n• Produtor Executivo\n• Acelerador digital",
            category: "skills",
            sidebar: false,
            ordem: 2
        },
        {
            title: "Cursos",
            content: "**PROJETO E PRODUÇÃO.**\nProjeto e produção para shows e eventos. LC Du'arte. Curso 100% presencial. Conclusão 2015.\n\n**PROFISSIONALIZAÇÃO TEATRAL.**\nNúcleo de profissionalização teatral Lala Schneider. Curso 100% presencial. Conclusão 2018.\n\n**JUSTIÇA RESTAURATIVA E CNV.**\nComunicação não violenta e Justiça restaurativa. Secretaria de JR-CNV da vicegovernadoria do estado do Ceará. Curso 100% online. Conclusão 2020.\n\n**FOTOGRAFIA.**\nFotografia Profissional. Centro Europeu escola de Profissões. Curso 100% presencial. Conclusão 2022.\n\n**EDIÇÃO E MANIPULAÇÃO.**\nEspecialização completa com mais de 500 horas em edição e manipulação não destrutiva usando softwares Adobe. Conclusão 2023.",
            category: "education",
            sidebar: true,
            ordem: 3
        },
        {
            title: "Histórico de Trabalho",
            content: "**ADMINISTRADOR DE ACERVO**\nJuarez Machado | Julho-2021 - Janeiro-2022\nAdministrei o Acervo de obras do Artista Juarez Machado em Curitiba desde a montagem até a entrega da exposição ao museu. Mantive todas as obras catalogadas, organizadas e com o histórico em dia, recebi e despachei obras para parceiros comerciais, museus, galerias e afins. No total eram 3.6 milhões em obras de arte sob minha administração.\n\n**ASSISTENTE DE FOTOGRAFIA**\nNuno Papp Fotografia | Agosto-2022 - Dezembro-2023\nAssim que o curso se aproximava do fim, entramos no módulo de fotografia publicitária, onde tive o prazer de conhecer o Professor Nuno Papp na última aula ele me convidou pra acompanhar alguns Jobs (Berenice, Eudora, Oui perfumaria, revista Topview). Depois de alguns freelas eu já fazia parte da família Papp, e em 2023 assumi como assistente fixo no estúdio.\n\n**FOTÓGRAFO E PRODUTOR**\nStudio Thiago Battista\nDepois de trabalhar com grandes nomes do cenário internacional e ter aprendido muito com eles decidi caminhar em direção de novos horizontes com novos desafios. Escrevi um projeto de Aceleração digital para o Museu Cristóforo Colombo que foi aprovado na Lei Paulo Gustavo. Decidi então que era hora de fundar meu próprio estúdio e atuar nas áreas em que eu me especializei. Desde então tenho atuado em projetos culturais e publicitários de grande destaque como o Festival de Teatro de Curitiba entre outros.",
            category: "experience",
            sidebar: false,
            ordem: 4
        },
        {
            title: "Contato",
            content: "studio.thiagobattista@gmail.com\n(41) 99793-5507\n@thiago_battista_",
            category: "contact",
            sidebar: true,
            ordem: 0
        }
    ];

    console.log("Seeding CV sections...");
    for (const section of sections) {
        await prisma.cVSection.create({ data: section });
    }

    console.log("Done!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
