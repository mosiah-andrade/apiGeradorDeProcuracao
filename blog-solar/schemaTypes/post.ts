import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'post',
  title: 'Post do Blog',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título do Artigo',
      type: 'string',
      description: 'Título focado em palavras-chave (Ex: Como agilizar a homologação solar).',
      validation: Rule => Rule.required().error('O título é obrigatório para o SEO.'),
    }),
    defineField({
      name: 'slug',
      title: 'URL Amigável (Slug)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Resumo para SEO (Meta Description)',
      type: 'text',
      rows: 3,
      description: 'Este texto aparece nos resultados de busca do Google. Seja direto e use palavras-chave.',
      validation: Rule => Rule.max(160).warning('O Google corta resumos com mais de 160 caracteres.'),
    }),
    defineField({
      name: 'seoKeywords',
      title: 'Palavras-chave (Tags)',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      description: 'Ex: energia solar, Neoenergia, homologação, integrador solar.',
    }),
    defineField({
      name: 'author',
      title: 'Autor',
      type: 'reference',
      to: { type: 'author' },
    }),
    defineField({
      name: 'mainImage',
      title: 'Imagem de Capa',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Texto Alternativo (Alt Text)',
          description: 'Descreva a imagem para o Google e para acessibilidade.',
          validation: Rule => Rule.required().error('O Alt Text é obrigatório para SEO.'),
        }
      ]
    }),
    defineField({
      name: 'categories',
      title: 'Categorias',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Data de Publicação',
      type: 'datetime',
    }),
    
    // CONTEÚDO DO POST COM CONFIGURAÇÃO DE LINKS EXTERNOS
    defineField({
      name: 'body',
      title: 'Conteúdo do Artigo',
      type: 'array',
      of: [
        {
          type: 'block',
          // Personalização das marcas (negrito, links, etc)
          marks: {
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Inserir Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL do Link',
                    description: 'Cole a URL completa (https://...)',
                    validation: Rule => Rule.uri({
                        scheme: ['http', 'https', 'mailto', 'tel']
                    })
                  },
                  {
                    name: 'blank',
                    title: 'Abrir em nova aba?',
                    type: 'boolean',
                    description: 'Recomendado para links externos (SEO).',
                    initialValue: false
                  }
                ]
              }
            ]
          }
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Texto Alternativo da Imagem',
            }
          ]
        }
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const { author } = selection
      return { ...selection, subtitle: author && `por ${author}` }
    },
  },
})