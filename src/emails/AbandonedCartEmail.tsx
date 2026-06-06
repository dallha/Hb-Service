import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface AbandonedCartEmailProps {
  email: string;
  items: Array<{
    name: string;
    size: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }>;
  checkoutUrl: string;
}

export const AbandonedCartEmail = ({
  email = 'client@example.com',
  items = [],
  checkoutUrl = 'https://hbservice.com/checkout',
}: AbandonedCartEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Vous avez oublié quelque chose chez HB Service ?</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Votre panier vous attend</Heading>
          
          <Text style={text}>Bonjour,</Text>
          <Text style={text}>
            Nous avons remarqué que vous n'avez pas finalisé votre commande sur HB Service. 
            Vos articles prestigieux vous attendent sagement dans votre panier.
          </Text>

          <Section style={itemsSection}>
            {items.map((item, index) => (
              <div key={index} style={itemRow}>
                {item.imageUrl && (
                  <Img src={item.imageUrl} width="50" height="50" alt={item.name} style={itemImage} />
                )}
                <div style={itemDetails}>
                  <Text style={itemName}>{item.name}</Text>
                  <Text style={itemSub}>{item.size} - Qté: {item.quantity}</Text>
                </div>
                <Text style={itemPrice}>{item.price.toLocaleString('fr-FR')} FCFA</Text>
              </div>
            ))}
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={checkoutUrl}>
              Finaliser ma commande
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Si vous avez des questions ou besoin d'aide pour choisir le parfum parfait, 
            n'hésitez pas à nous contacter sur WhatsApp ou par e-mail.
          </Text>
          <Text style={footer}>L'équipe HB Service</Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#F8F7F5',
  fontFamily: 'Inter, -apple-system, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const h1 = {
  color: '#1A1A1A',
  fontSize: '24px',
  fontWeight: 'normal',
  fontFamily: 'Playfair Display, serif',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const text = {
  color: '#4A4A4A',
  fontSize: '16px',
  lineHeight: '24px',
};

const itemsSection = {
  margin: '20px 0',
  padding: '20px',
  backgroundColor: '#ffffff',
  borderRadius: '4px',
  border: '1px solid #E8E0D5',
};

const itemRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px',
  paddingBottom: '15px',
  borderBottom: '1px solid #E8E0D5',
};

const itemImage = {
  borderRadius: '4px',
  objectFit: 'cover' as const,
};

const itemDetails = {
  flex: 1,
  padding: '0 15px',
};

const itemName = {
  margin: 0,
  fontSize: '14px',
  color: '#1A1A1A',
  fontWeight: 'bold',
};

const itemSub = {
  margin: '5px 0 0',
  fontSize: '12px',
  color: '#8C8C8C',
};

const itemPrice = {
  margin: 0,
  fontSize: '14px',
  color: '#1A1A1A',
  fontWeight: 'bold',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#D4AF37',
  borderRadius: '2px',
  color: '#1A1A1A',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const hr = {
  borderColor: '#E8E0D5',
  margin: '20px 0',
};

const footer = {
  color: '#8C8C8C',
  fontSize: '12px',
  lineHeight: '20px',
};

export default AbandonedCartEmail;
