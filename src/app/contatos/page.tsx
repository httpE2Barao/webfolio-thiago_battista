"use client";

import TituloResponsivo from "@/components/TituloResponsivo";
import ResponsiveText from "@/components/ResponsiveText";
import { FiMail, FiInstagram, FiLinkedin, FiGithub, FiMapPin, FiPhone } from "react-icons/fi";

const Highlight = ({ children }: { children: React.ReactNode }) => {
  return <span style={{ color: 'var(--accent)' }}>{children}</span>;
};

const ContactItem = ({ icon: Icon, title, content, link }: {
  icon: React.ElementType;
  title: string;
  content: string;
  link?: string;
}) => {
  return (
    <div className="flex items-start space-x-4 mb-6">
      <div className="mt-1 text-2xl" style={{ color: 'var(--accent)' }}>
        <Icon />
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-1">{title}</h3>
        {link ? (
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline transition-colors"
            style={{ color: 'var(--foreground)' }}
          >
            {content}
          </a>
        ) : (
          <p>{content}</p>
        )}
      </div>
    </div>
  );
};

export const dynamic = "force-dynamic";

export default function ContatosPage() {
  return (
    <div className="p-4">
      <TituloResponsivo>Entre em contato</TituloResponsivo>
      <div className="md:p-6 font-mono max-w-4xl mx-auto">
        <ResponsiveText>
          Estou sempre aberto a novas oportunidades e colaborações. Se você tem um projeto em mente, 
          gostaria de discutir possibilidades de trabalho ou simplesmente querer trocar uma ideia, 
          sinta-se à vontade para entrar em contato comigo através dos canais abaixo.
        </ResponsiveText>
        
        <div className="mt-8">
          <ContactItem 
            icon={FiMail} 
            title="E-mail" 
            content="contato@thiagobattista.com" 
            link="mailto:contato@thiagobattista.com"
          />
          
          <ContactItem 
            icon={FiPhone} 
            title="Telefone" 
            content="+55 (41) 99999-9999"
          />
          
          <ContactItem 
            icon={FiMapPin} 
            title="Localização" 
            content="Curitiba, PR - Brasil"
          />
          
          <ContactItem 
            icon={FiInstagram} 
            title="Instagram" 
            content="@thiagobattista" 
            link="https://instagram.com/thiagobattista"
          />
          
          <ContactItem 
            icon={FiLinkedin} 
            title="LinkedIn" 
            content="Thiago Battista" 
            link="https://linkedin.com/in/thiagobattista"
          />
          
          <ContactItem 
            icon={FiGithub} 
            title="GitHub" 
            content="thiagobattista" 
            link="https://github.com/thiagobattista"
          />
        </div>
        
        <div className="mt-10 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-2xl font-bold mb-4">Projetos e Colaborações</h3>
          <ResponsiveText>
            Estou disponível para projetos de <Highlight>fotografia</Highlight>, <Highlight>produção cultural</Highlight>, 
            <Highlight>desenvolvimento web</Highlight> e <Highlight>consultoria em aceleração digital</Highlight>. 
            Se você representa uma instituição cultural, empresa ou está desenvolvendo um projeto pessoal, 
            adoraria conversar sobre como posso contribuir.
          </ResponsiveText>
          
          <ResponsiveText className="mt-4">
            Para propostas de trabalho, por favor, inclua informações sobre o projeto, prazo estimado e 
            orçamento disponível. Isso me ajuda a entender melhor suas necessidades e retornar mais rapidamente.
          </ResponsiveText>
        </div>
      </div>
    </div>
  );
}
