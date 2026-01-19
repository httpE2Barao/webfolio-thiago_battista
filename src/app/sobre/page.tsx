"use client";

import ResponsiveText from "@/components/ResponsiveText";
import TituloResponsivo from "@/components/TituloResponsivo";

const Highlight = ({ children }: { children: React.ReactNode }) => {
  return <span className="text-red-500">{children}</span>;
};

export const dynamic = "force-dynamic";

export default function ContatosPage() {
  return (
    <div className="p-4">
      <TituloResponsivo>Quem sou eu</TituloResponsivo>
      <div className="md:p-6 font-mono">
        <ResponsiveText>
          Nascido na energia dos <Highlight>anos 90</Highlight>, minha jornada no universo visual começou com uma <Highlight>câmera analógica</Highlight> na mão e um rolinho de 36 cliques. Lembro-me das viagens com meus pais, passando pelo aconchegante <Highlight>Purunã</Highlight> – com aquele clima sereno e o cheirinho de café fresco do interior – até os cenários urbanos. Foi nessas aventuras que aprendi a mágica de um simples clique, desenvolvendo uma visão do mundo repleta de sensibilidade e curiosidade.
        </ResponsiveText>
        <ResponsiveText>
          Inspirado pelo olhar marcante de mestres como <Highlight>Platon</Highlight> e <Highlight>Annie Leibovitz</Highlight>, logo percebi que a fotografia seria minha forma de explorar diversas expressões culturais. Ao longo dos anos, tive a oportunidade de participar de projetos incríveis: desde a campanha anual do <Highlight>Shopping Palladim</Highlight>, onde atuei na assistência de fotografia, até o trabalho no estúdio do fotógrafo <Highlight>Nuno Papp</Highlight>, onde criei campanhas para marcas renomadas como o <Highlight>Grupo O Boticário</Highlight>.
        </ResponsiveText>
        <ResponsiveText>
          Meu olhar versátil também encontrou espaço em editoriais descolados para revistas como a <Highlight>Top View</Highlight> e em grandes palcos – já estive por trás das câmeras em shows de artistas como <Highlight>Janine Matias</Highlight>, <Highlight>Emicida</Highlight>, <Highlight>Mc Livinho</Highlight>, <Highlight>Leci Brandão</Highlight> e <Highlight>Dow Raiz</Highlight>. Minha paixão pelo registro de performances começou no teatro, quando ainda estudava e fotografava as peças dos amigos. Com o tempo, tive o privilégio de capturar espetáculos marcantes, como <Highlight>Bonitinha Mais Hordinária</Highlight>, e festivais incríveis, como o <Highlight>Festival de Teatro de Curitiba</Highlight> – onde pude registrar a energia de produções como <Highlight>Duelo Amazônico</Highlight>, <Highlight>Duetos</Highlight> e <Highlight>Agora É Que São Elas</Highlight>.
        </ResponsiveText>
        <ResponsiveText>
          Entre a nostalgia dos cliques analógicos e a inovação das novas tecnologias, meu trabalho celebra a fusão entre <Highlight>arte</Highlight>, <Highlight>cultura</Highlight> e <Highlight>tecnologia</Highlight>, transformando histórias únicas em imagens que ficam na memória e inspiram o olhar contemporâneo.
        </ResponsiveText>
        <ResponsiveText>
          Atualmente, meu foco também se volta para projetos que unem <Highlight>inovação</Highlight>, <Highlight>digitalização</Highlight> e <Highlight>cultura</Highlight>. Desenvolvi e sou o gestor cultural do projeto de <Highlight>Aceleração Digital do Museu Municipal Cristoforo Colombo</Highlight>, onde transformamos um museu “zero digital” em um espaço 100% digital – com um repositório acessível que reúne todo o acervo, completamente digitalizado utilizando as melhores ferramentas e tecnologias. Essa iniciativa não apenas preserva nossa história, mas também democratiza o acesso à cultura, aproximando o público do passado por meio da tecnologia.
        </ResponsiveText>
        <ResponsiveText>
          Paralelamente, desenvolvi e sou coordenador cultural da <Highlight>HUB Cultural</Highlight>, uma plataforma digital inovadora que vai muito além da educação a distância tradicional. Criada para ser um verdadeiro núcleo de formação e conexão para talentos na área cultural, a HUB Cultural integra cursos, workshops, mentorias e espaços de networking. Lá, profissionais consagrados e aspirantes a produtores e artistas se encontram num <Highlight>ambiente colaborativo</Highlight> que incentiva a troca de experiências e o surgimento de novas ideias, conectando arte, cultura e tecnologia de forma transformadora. Ao democratizar o acesso à <Highlight>educação de alta qualidade</Highlight>, a plataforma permite que pessoas de diferentes regiões e contextos aprimorem suas habilidades criativas e técnicas, impulsionando o <Highlight>empreendedorismo cultural</Highlight>, <Highlight>revitalizando comunidades</Highlight> e promovendo diversidade e inclusão.
        </ResponsiveText>
        <ResponsiveText>
          Para trabalhar com tamanha qualidade, conto com ferramentas e softwares de ponta que me ajudam nessa jornada. Utilizo o <Highlight>Notion</Highlight> para organização, mantendo tudo em dia. Minha câmera de referência é a top de linha <Highlight>Fijfilmx-t5</Highlight>, consagrada no mercado pela qualidade excepcional e pela fidelidade na reprodução de cores. No campo digital, recorro ao <Highlight>Lightroom Classic</Highlight> e ao <Highlight>Photoshop</Highlight>, sempre aliado às novas possibilidades da <Highlight>inteligência artificial generativa</Highlight>. Atualmente, também estou expandindo meus horizontes através do estudo de escaneamento e <Highlight>modelagem 3D</Highlight>, além de explorar tecnologias voltadas para a preservação do patrimônio e a educação.
        </ResponsiveText>
        <ResponsiveText>
          Esses trabalhos reafirmam meu compromisso em unir <Highlight>tecnologia</Highlight> e <Highlight>cultura</Highlight>, criando pontes que transformam a maneira como vivenciamos e preservamos nossa história e nossa arte.
        </ResponsiveText>
      </div>
    </div>
  );
}
