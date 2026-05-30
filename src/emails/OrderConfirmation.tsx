import React from 'react';
import {
  Body,
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
import { formatPrice } from '@/lib/format';

interface OrderConfirmationProps {
  orderId: string;
  totalAmount: number;
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export const OrderConfirmationEmail = ({
  orderId,
  totalAmount,
  items,
}: OrderConfirmationProps) => {
  return (
    <Html>
      <Head />
      <Preview>Merci pour votre commande chez HB Service !</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Merci pour votre achat !</Heading>
          
          <Text style={text}>
            Bonjour,
          </Text>
          <Text style={text}>
            Nous avons bien reçu votre commande <strong>#{orderId.slice(-8).toUpperCase()}</strong>. 
            Elle est actuellement en cours de préparation. Nous vous informerons dès son expédition.
          </Text>

          <Hr style={hr} />

          <Section style={section}>
            <Heading as="h2" style={h2}>Résumé de la commande</Heading>
            {items.map((item, index) => (
              <div key={index} style={itemRow}>
                <Text style={itemName}>{item.quantity}x {item.name} ({item.size})</Text>
                <Text style={itemPrice}>{formatPrice(item.unitPrice * item.quantity)}</Text>
              </div>
            ))}
          </Section>

          <Hr style={hr} />

          <Section style={totalSection}>
            <Text style={totalLabel}>Total</Text>
            <Text style={totalValue}>{formatPrice(totalAmount)}</Text>
          </Section>

          <Text style={footer}>
            Si vous avez des questions, n'hésitez pas à nous contacter sur WhatsApp au +212 601 13 45 45.
            <br />
            L'équipe HB_Service
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;

const main = {
  backgroundColor: '#F8F7F5',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #E8E0D5',
  overflow: 'hidden',
  marginTop: '40px',
  marginBottom: '40px',
  paddingLeft: '40px',
  paddingRight: '40px',
};

const h1 = {
  color: '#1A1A1A',
  fontSize: '24px',
  fontWeight: 'bold',
  paddingTop: '32px',
  paddingBottom: '32px',
  margin: '0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1A1A1A',
  fontSize: '18px',
  fontWeight: 'bold',
  marginTop: '0',
  marginBottom: '16px',
};

const text = {
  color: '#444444',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
};

const section = {
  padding: '24px 0',
};

const itemRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '12px',
};

const itemName = {
  margin: '0',
  color: '#444444',
  fontSize: '14px',
};

const itemPrice = {
  margin: '0',
  color: '#1A1A1A',
  fontSize: '14px',
  fontWeight: 'bold',
};

const totalSection = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '24px 0',
};

const totalLabel = {
  margin: '0',
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1A1A1A',
};

const totalValue = {
  margin: '0',
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1A1A1A',
};

const hr = {
  borderColor: '#E8E0D5',
  margin: '0',
};

const footer = {
  color: '#8C8C8C',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  marginTop: '48px',
};
