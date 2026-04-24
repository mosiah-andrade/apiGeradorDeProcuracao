"use client";
import { redirect } from 'next/dist/server/api-utils';
import AnimatedBadge from './components/AnimatedWrapper';
 // Ajuste o caminho conforme seu projeto
import { ArrowRight, Target, Eye, Heart, ClockCounterClockwise, Rocket, LinkedinLogo, } from '@phosphor-icons/react';

interface MemberProps {
  name: string;
  role: string;
  image: string;
  bio: string;
  linkedin: string;
}

const TeamMember = ({ name, role, image, bio, linkedin }: MemberProps) => (
  <AnimatedBadge
    whileHover={{ y: -5 }}
    className="group bg-white rounded-xl overflow-hidden border border-slate-200 transition-all duration-300 hover:shadow-md"
  >
    <div className="aspect-[4/5] bg-slate-100 overflow-hidden relative border-b border-slate-200">
      <img 
        src={image} 
        alt={name} 
        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
        referrerPolicy="no-referrer"
      />
    </div>
    <div className="p-5">
      <h3 className="font-bold text-slate-900">{name}</h3>
      <p className="text-[10px] uppercase tracking-widest text-green-600 font-bold mb-3">{role}</p>
      <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">{bio}</p>
      <div className="mt-4 flex gap-3">
        <a href={linkedin} target="_blank" rel="noopener noreferrer">
            <LinkedinLogo className="w-3.5 h-3.5 text-slate-400 hover:text-green-600 cursor-pointer" />
        </a>
      </div>
    </div>
  </AnimatedBadge>
);

const ValueCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <AnimatedBadge
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="p-8 bg-white rounded-2xl border border-slate-200 hover:border-green-200 transition-all shadow-sm"
  >
    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-6">
      <Icon className="w-5 h-5 text-green-600" />
    </div>
    <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">{title}</h4>
    <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
  </AnimatedBadge>
);

export default function QuemSomos() {
  const team = [
    {
      name: "Mosiah Andrade",
      role: "CTO & Fundador",
      image: "/mosiah-andrade.jpeg",
      bio: "Com mais de 3 anos de experiência em desenvolvimento, Mosiah percebeu na energia solar uma oportunidade de modernização a automação livrando horar de trabalho repetitivo em sistemas que poderiam ser automatizados minimizando erro humano.",
      linkedin: "https://linkedin.com/in/mosiah-andrade"
    }
  ];

  return (
    <div className="min-h-screen  font-sans text-slate-900 selection:bg-green-100 selection:text-green-900">
      <main className="pt-20">
        {/* Hero Section */}
        <section className=" border-b border-slate-200 pb-12 px-12">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <AnimatedBadge
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-block px-3 py-1 mb-6 text-[10px] font-bold tracking-[0.2em] text-green-600 border border-green-200 rounded-full uppercase bg-green-50"
              >
                Sobre Nós
              </AnimatedBadge>
              <h1 className="text-6xl md:text-7xl font-extrabold leading-[1.05] text-slate-900 mb-8 tracking-tight">
                <span className="text-green-600">Inovação Digital</span><br/> no sangue
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-xl mb-10">
                Fundada na necessidade de modernização nos processos da elaboração e instalação de sistemas fotovoltaico, a Asaweb nasceu com a missão de transformar o mercado de energia solar através de soluções digitais inteligentes e acessíveis.
              </p>
              
            </div>
            
            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                //   { value: '12+', label: 'Anos de Mercado' },
                  { value: '15+', label: 'Projetos Entregues' },
                //   { value: '45', label: 'Especialistas' },
                  { value: '98%', label: 'Satisfação' }
                ].map((stat, i) => (
                  <div key={i} className="p-8 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-4xl font-bold text-green-600 mb-2 underline decoration-4 decoration-green-50">{stat.value}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 px-12 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-6 mb-16">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-[0.3em] whitespace-nowrap">Nossos Pilares</h2>
              <div className="h-px bg-slate-200 w-full"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <ValueCard 
                icon={Target} 
                title="Missão" 
                description="Transformar negócios através de soluções digitais criativas e eficazes que geram impacto real na sociedade."
              />
              <ValueCard 
                icon={Eye} 
                title="Visão" 
                description="Ser referência global em Tecnologia no ramo de energia solar, mantendo a alma humana em cada detalhe."
              />
              <ValueCard 
                icon={Heart} 
                title="Valores" 
                description="Empatia, transparência, busca contínua por conhecimento e respeito à diversidade de ideias."
              />
            </div>
          </div>
        </section>

        {/* History Details */}
        <section className="py-24 px-12 bg-white">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
            <div className="relative group">
              <img 
                src="https://images.unsplash.com/photo-1603201667106-0e3e0ae584c5?q=80&w=1234" 
                className="rounded-xl filter grayscale group-hover:grayscale-0 transition-all duration-1000 shadow-xl border border-slate-100" 
                alt="Workspace"
              />
              <div className="absolute -bottom-10 -right-10 bg-green-600 p-10 rounded-xl text-white shadow-2xl hidden lg:block">
                <p className="text-xs uppercase tracking-[0.2em] font-bold mb-2">Unidos pela</p>
                <p className="text-5xl font-black italic">Inovação</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 text-green-600">
                <ClockCounterClockwise className="w-5 h-5" /> 
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Legado & Futuro</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-snug">
                Nossa jornada é guiada pelo compromisso com a excelência técnica.
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Nascemos em um ambiente de constante mudança. Ao longo de muitas normas e atualizações, refinamos nossos processos para oferecer não apenas documentos, mas inteligência estratégica aplicada aos negócios e eficiencia.
              </p>
              <div className="pt-8 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Estratégia</h4>
                    <p className="text-xs text-slate-500 leading-relaxed text-justify">Análise profunda da necessidade do mercado, focando na simplicidade e economia de tempo</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Segurança</h4>
                    <p className="text-xs text-slate-500 leading-relaxed text-justify">Tecnologias modernas que permitem que seus documentos sejam gerador de forma eficiente e rapida mantendo a segurança dos seus dados.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24 px-12 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-16">
              <div className="max-w-md">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">Liderança</h2>
                <p className="text-sm text-slate-500">Conheça as mentes por trás de nossas estratégias e criações.</p>
              </div>
              <div className="hidden md:block h-px flex-1 mx-12 bg-slate-200"></div>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <TeamMember 
                  // @ts-ignore
                  key={index} 
                  name={member.name}
                  role={member.role}
                  image={member.image}
                  bio={member.bio}
                  linkedin={member.linkedin}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-12 bg-white text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8">
              Preparado para elevar seu <span className="text-green-600">posicionamento digital</span>?
            </h2>
            <p className="text-slate-500 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Vamos conversar sobre seus objetivos e como nossa expertise pode acelerar seus resultados de forma sustentável.
            </p>
            <a href='https://wa.me/558189289155?text=Olá,%20gostaria%20de%20uma%20consultoria%20estrategica' className="bg-slate-900 text-white px-10 py-4 rounded-md font-bold uppercase text-xs tracking-widest hover:bg-slate-800 transition-all hover:scale-[1.02]">
              Agendar Consultoria Estratégica
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
