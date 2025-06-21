import { VStack, Text, Link } from "@chakra-ui/react";
import React from "react";

const SpecimenFooter: React.FC = () => (
  <VStack mt={8} pt={4} borderTopWidth={1} spacing={1}>
    <Text fontSize="sm" color="gray.500">
      Copyright © 2025
    </Text>
    <Link
      href="https://www.its.ac.id"
      isExternal
      color="blue.500"
      fontSize="sm"
    >
      Institut Teknologi Sepuluh Nopember
    </Link>
  </VStack>
);

export default SpecimenFooter;
