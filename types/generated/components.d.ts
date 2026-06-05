import type { Schema, Struct } from '@strapi/strapi';

export interface ArticleAttachment extends Struct.ComponentSchema {
  collectionName: 'components_article_attachments';
  info: {
    displayName: 'attachment';
    icon: 'attachment';
  };
  attributes: {
    file: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    title: Schema.Attribute.String;
  };
}

export interface ArticleSource extends Struct.ComponentSchema {
  collectionName: 'components_article_sources';
  info: {
    displayName: 'Source';
    icon: 'link';
  };
  attributes: {
    source_type: Schema.Attribute.Enumeration<
      [
        'Official website',
        'Trusted website',
        'Forum',
        'Brochure',
        'Manual',
        'Other',
      ]
    >;
    title: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface ArticleVideo extends Struct.ComponentSchema {
  collectionName: 'components_article_videos';
  info: {
    displayName: 'Video';
    icon: 'play';
  };
  attributes: {
    platform: Schema.Attribute.Enumeration<['YouTube', 'Vimeo', 'Other']>;
    title: Schema.Attribute.String;
    video_url: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'article.attachment': ArticleAttachment;
      'article.source': ArticleSource;
      'article.video': ArticleVideo;
    }
  }
}
